import { ref, unref } from 'vue';

export function useLockFn<P extends any[] = any[], V = any>(fn: (...args: P) => Promise<V>) {
  const lockRef = ref(false);
  return async function (...args: P) {
    // 这里是使用闭包保存lockRef的值，防止多次锁定
    // 这也就是说该hook可能在不同场景对同一个函数调用？
    
    // 看到下面发现这个hook其实应该是针对异步函数调的，
    // 类似axios封装里的取消pending请求，防止同一个异步函数
    // 被调用两次就能做到同步的效果了
    if (unref(lockRef)) return;
    lockRef.value = true;
    // 用async语法糖的resolve和reject写法，也就是return和throw
    // 在执行完之前只调用一次异步函数
    try {
      const ret = await fn(...args);
      lockRef.value = false;
      return ret;
    } catch (e) {
      lockRef.value = false;
      throw e;
    }
  };
}
