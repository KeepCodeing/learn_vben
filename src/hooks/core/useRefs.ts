import type { Ref } from 'vue';
import { ref, onBeforeUpdate } from 'vue';

// 应该是vben的一些场景会用到的 HTML元素响应式化 暂且看不出来
// 怎么用...
export function useRefs(): [Ref<HTMLElement[]>, (index: number) => (el: HTMLElement) => void] {
  const refs = ref([]) as Ref<HTMLElement[]>;

  onBeforeUpdate(() => {
    refs.value = [];
  });

  const setRefs = (index: number) => (el: HTMLElement) => {
    refs.value[index] = el;
  };

  return [refs, setRefs];
}
