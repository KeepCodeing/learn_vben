import { nextTick, onMounted, onActivated } from 'vue';


// 对Vue3 hooks的封装，把onMounted和onActive封装在一起了
// 因为这两hook的作用场景确实是非常类似的
export function onMountedOrActivated(hook: Fn) {
  let mounted: boolean;

  onMounted(() => {
    hook();
    nextTick(() => {
      mounted = true;
    });
  });

  onActivated(() => {
    if (mounted) {
      hook();
    }
  });
}
