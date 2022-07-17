import { getCurrentInstance, reactive, shallowRef, watchEffect } from 'vue';
import type { Ref } from 'vue';
interface Params {
  excludeListeners?: boolean;
  excludeKeys?: string[];
  excludeDefaultKeys?: boolean;
}

const DEFAULT_EXCLUDE_KEYS = ['class', 'style'];
const LISTENER_PREFIX = /^on[A-Z]/;

export function entries<T>(obj: Recordable<T>): [string, T][] {
  return Object.keys(obj).map((key: string) => [key, obj[key]]);
}

// 对attrs进行处理的hook，主要包括去掉class这种属性、不想包含的属性、是否包含事件属性等功能
// 由此可以看出来hook封装不一定是完全要对业务逻辑进行处理，针对Vue3自带的hooks的扩展也可以
// 封装为hook使用
export function useAttrs(params: Params = {}): Ref<Recordable> | {} {
  // 如何在自己封装的hook里调用当前组件的hook？使用getCurrentInstance获取
  const instance = getCurrentInstance();
  if (!instance) return {};

  const { excludeListeners = false, excludeKeys = [], excludeDefaultKeys = true } = params;
  const attrs = shallowRef({});
  const allExcludeKeys = excludeKeys.concat(excludeDefaultKeys ? DEFAULT_EXCLUDE_KEYS : []);

  // Since attrs are not reactive, make it reactive instead of doing in `onUpdated` hook for better performance
  instance.attrs = reactive(instance.attrs);

  watchEffect(() => {
    const res = entries(instance.attrs).reduce((acm, [key, val]) => {
      if (!allExcludeKeys.includes(key) && !(excludeListeners && LISTENER_PREFIX.test(key))) {
        acm[key] = val;
      }

      return acm;
    }, {} as Recordable);

    attrs.value = res;
  });

  return attrs;
}
