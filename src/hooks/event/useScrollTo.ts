import { isFunction, isUnDef } from '/@/utils/is';
import { ref, unref } from 'vue';

export interface ScrollToParams {
  el: any;
  to: number;
  duration?: number;
  callback?: () => any;
}

const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};
const move = (el: HTMLElement, amount: number) => {
  el.scrollTop = amount;
};

const position = (el: HTMLElement) => {
  return el.scrollTop;
};

// 从某个元素滑动到指定元素
// 并没有使用前面的useScroll钩子，因为只需要计算出当前元素的scrollTop和要
// 滑动到的元素的scrollTop的差值，然后进行JS动画模拟就行了...
export function useScrollTo({ el, to, duration = 500, callback }: ScrollToParams) {
  const isActiveRef = ref(false);
  const start = position(el);
  // 计算滑动差值，这里似乎并不是滑动到指定元素，而是滑动到指定位置...
  const change = to - start;
  const increment = 20;
  let currentTime = 0;
  duration = isUnDef(duration) ? 500 : duration;

  // 滑动动画
  const animateScroll = function () {
    // 调用run后递归才会生效，调用stop递归提前结束
    // 因为滑动位置满足了递归也会结束，所以这个isActiveRef是用来
    // 提前结束动画的
    if (!unref(isActiveRef)) {
      return;
    }
    currentTime += increment;
    const val = easeInOutQuad(currentTime, start, change, duration);
    move(el, val);
    if (currentTime < duration && unref(isActiveRef)) {
      // 使用requestAnimationFrame递归调用
      requestAnimationFrame(animateScroll);
    } else {
      if (callback && isFunction(callback)) {
        callback();
      }
    }
  };
  const run = () => {
    isActiveRef.value = true;
    animateScroll();
  };

  const stop = () => {
    isActiveRef.value = false;
  };

  return { start: run, stop };
}
