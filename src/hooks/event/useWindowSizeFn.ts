import { tryOnMounted, tryOnUnmounted, useDebounceFn } from '@vueuse/core';

interface WindowSizeOptions {
  once?: boolean;
  immediate?: boolean;
  listenerOptions?: AddEventListenerOptions | boolean;
}

// 这个钩子和前面的breakpoint是不一样的，它只是用来监听窗口发生改变的
// 而且它不提供任何窗口改变的信息，只是改变时调用fn，可以理解成帮我们
// 封装了事件监听器的绑定和解绑
// 这么看来hook的作用范围其实是非常大的，Vue3自己的hook可以被包装，一些
// 重复逻辑也可以用hook包装
export function useWindowSizeFn<T>(fn: Fn<T>, wait = 150, options?: WindowSizeOptions) {
  let handler = () => {
    fn();
  };
  const handleSize = useDebounceFn(handler, wait);
  handler = handleSize;

  const start = () => {
    if (options && options.immediate) {
      handler();
    }
    window.addEventListener('resize', handler);
  };

  const stop = () => {
    window.removeEventListener('resize', handler);
  };

  tryOnMounted(() => {
    start();
  });

  tryOnUnmounted(() => {
    stop();
  });
  return [start, stop];
}
