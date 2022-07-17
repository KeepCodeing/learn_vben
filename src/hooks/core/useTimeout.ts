import { ref, watch } from 'vue';
import { tryOnUnmounted } from '@vueuse/core';
import { isFunction } from '/@/utils/is';

export function useTimeoutFn(handle: Fn<any>, wait: number, native = false) {
  if (!isFunction(handle)) {
    throw new Error('handle is not Function!');
  }

  const { readyRef, stop, start } = useTimeoutRef(wait);
  if (native) {
    handle();
  } else {
    // 通过watch监听定时器是否执行完毕，因为没有用Promise所以只能
    // 这样写，但用了会加深代码层级，用async又会变成同步的...
    watch(
      readyRef,
      // maturity: 到期
      (maturity) => {
        maturity && handle();
      },
      { immediate: false },
    );
  }
  // 返回定时器是否到期和终止开始函数
  return { readyRef, stop, start };
}

// 这里的定时器调用并不是用Promise的形式完成的，如果使用Promise的话
// 似乎会将问题复杂化。这个钩子的作用就是过wait毫秒后调用handle，而
// 不是过若干秒后resolve调用handle，虽然这样也可以...

export function useTimeoutRef(wait: number) {
  const readyRef = ref(false);

  let timer: TimeoutHandle;
  function stop(): void {
    readyRef.value = false;
    timer && window.clearTimeout(timer);
  }
  function start(): void {
    stop();
    timer = setTimeout(() => {
      readyRef.value = true;
    }, wait);
  }

  start();

  tryOnUnmounted(stop);

  return { readyRef, stop, start };
}
