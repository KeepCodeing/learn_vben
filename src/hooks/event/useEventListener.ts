import type { Ref } from 'vue';
import { ref, watch, unref } from 'vue';
import { useThrottleFn, useDebounceFn } from '@vueuse/core';

export type RemoveEventFn = () => void;
export interface UseEventParams {
  el?: Element | Ref<Element | undefined> | Window | any;
  name: string;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
  autoRemove?: boolean;
  isDebounce?: boolean;
  wait?: number;
}

// 事件监听器hook
export function useEventListener({
  el = window,
  name,
  listener,
  options,
  autoRemove = true,
  isDebounce = true,
  wait = 80,
}: UseEventParams): { removeEvent: RemoveEventFn } {
  /* eslint-disable-next-line */
  let remove: RemoveEventFn = () => {};
  const isAddRef = ref(false);

  if (el) {
    const element = ref(el as Element) as Ref<Element>;

    // 防抖和节流处理，如果传入了wait就使用防抖节流，否则使用函数本身就行
    // 感觉这里更好的写法是先判断wait，这样就不需要创建防抖节流函数了
    const handler = isDebounce ? useDebounceFn(listener, wait) : useThrottleFn(listener, wait);
    const realHandler = wait ? handler : listener;

    // 移除监听器和添加监听器
    const removeEventListener = (e: Element) => {
      isAddRef.value = true;
      e.removeEventListener(name, realHandler, options);
    };
    // 添加事件实际上只有一次，这样做是提供类型支持？
    const addEventListener = (e: Element) => e.addEventListener(name, realHandler, options);

    const removeWatch = watch(
      element,
      // 这个cleanUp是回调里传进来的，参考文档它是onInvalidate回调，
      // 会在下面的情况调用：
      // 1. 副作用即将重新执行时
      // 2. 侦听器被停止 (如果在 setup() 或生命周期钩子函数中使用了 watchEffect，则在组件卸载时)
      // 在文档中提到的常见应用是异步函数resolve前清理副作用，大概类似axios封装中的pending取消?
      (v, _ov, cleanUp) => {
        if (v) {
          // 这里的处理不太明白，大概是element变化后判断其是否被移除了监听器，
          // 如果没有就加上去，然后再调用副作用清除函数。但不知道应用场景...
          !unref(isAddRef) && addEventListener(v);
          cleanUp(() => {
            autoRemove && removeEventListener(v);
          });
        }
      },
      { immediate: true },
    );
    
    // 监听器移除，包含两步，移除element的监听器，移除新element的监听器？
    remove = () => {
      removeEventListener(element.value);
      removeWatch();
    };
  }
  return { removeEvent: remove };
}
