import {
  InjectionKey,
  provide,
  inject,
  reactive,
  readonly as defineReadonly,
  // defineComponent,
  UnwrapRef,
} from 'vue';

export interface CreateContextOptions {
  readonly?: boolean;
  createProvider?: boolean;
  native?: boolean;
}

type ShallowUnwrap<T> = {
  [P in keyof T]: UnwrapRef<T[P]>;
};


// 同样是对Vue3自带的hook进行封装，这里是对provide和inject，主要做了些类型支持和state
// 处理
export function createContext<T>(
  context: any,
  key: InjectionKey<T> = Symbol(),
  options: CreateContextOptions = {},
) {
  const { readonly = true, createProvider = false, native = false } = options;

  const state = reactive(context);
  // 判断state是否只读
  const provideData = readonly ? defineReadonly(state) : state;
  // 可选的provide？不选择创建provide就只对context进行一个响应式的包装，
  // 否则创建只读或原始的context provide
  // context作为依赖之后就默认失去了响应式，在官方文档中提供的解决办法是使用
  // computed对原始值进行包装，这里使用的是reactive，大概也是同理
  !createProvider && provide(key, native ? context : provideData);

  return {
    state,
  };
}

export function useContext<T>(key: InjectionKey<T>, native?: boolean): T;

// 这里用对象形式调用了inject，其好处是可以指定更多的配置，例如
// 注入from别名，defaultValue注入默认值等
// 官方文档提到如果需要注入的属性非常多，那么使用Symbol作为key是比较合理的
export function useContext<T>(
  key: InjectionKey<T> = Symbol(),
  defaultValue?: any,
): ShallowUnwrap<T> {
  return inject(key, defaultValue || {});
}
