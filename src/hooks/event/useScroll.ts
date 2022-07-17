import type { Ref } from 'vue';

import { ref, onMounted, watch, onUnmounted } from 'vue';
import { isWindow, isObject } from '/@/utils/is';
import { useThrottleFn } from '@vueuse/core';

// 这个钩子是用来监听滑动位置的
export function useScroll(
  refEl: Ref<Element | Window | null>,
  options?: {
    wait?: number;
    leading?: boolean;
    trailing?: boolean;
  },
) {
  const refX = ref(0);
  const refY = ref(0);
  // 更新滑动位置，不指定元素就使用window，否则使用元素内滑动位置
  let handler = () => {
    if (isWindow(refEl.value)) {
      refX.value = refEl.value.scrollX;
      refY.value = refEl.value.scrollY;
    } else if (refEl.value) {
      refX.value = (refEl.value as Element).scrollLeft;
      refY.value = (refEl.value as Element).scrollTop;
    }
  };

  if (isObject(options)) {
    let wait = 0;
    if (options.wait && options.wait > 0) {
      wait = options.wait;
      Reflect.deleteProperty(options, 'wait');
    }

    // 节流
    handler = useThrottleFn(handler, wait);
  }

  let stopWatch: () => void;
  onMounted(() => {
    // 监听滑动，当元素更新时给新元素绑定，给旧元素解绑
    // 同样带有副作用消除
    // 目前有点搞不懂refEl监听的目的，应该是指用户绑定元素后
    // 又使用相同变量绑定了另一个元素？但想不到这样做的目的...
    stopWatch = watch(
      refEl,
      (el, prevEl, onCleanup) => {
        if (el) {
          el.addEventListener('scroll', handler);
        } else if (prevEl) {
          prevEl.removeEventListener('scroll', handler);
        }
        onCleanup(() => {
          refX.value = refY.value = 0;
          el && el.removeEventListener('scroll', handler);
        });
      },
      { immediate: true },
    );
  });

  // 钩子销毁时解绑
  onUnmounted(() => {
    refEl.value && refEl.value.removeEventListener('scroll', handler);
  });

  function stop() {
    stopWatch && stopWatch();
  }

  // 导出当前滑动x，y位置和停止监听函数
  return { refX, refY, stop };
}
