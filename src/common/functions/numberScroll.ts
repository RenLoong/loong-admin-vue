import { DirectiveBinding, App, VNode } from 'vue';

/**
 * 数字转千分位
 * @param num 数字
 * @returns string
 * @example 10000 => 10,000
 * @example 10000.123 => 10,000.123
 * @example 10000.123456 => 10,000.123456
 */
const toThousands = (num: number | string): string => {
    let result = '', counter = 0;
    num = (num || 0).toString();
    for (let i = num.length - 1; i >= 0; i--) {
        counter++;
        result = num.charAt(i) + result;
        if (!(counter % 3) && i !== 0) { result = ',' + result; }
    }
    return result;
}
const animateValue = (el: HTMLElement, start: number, end: number, duration: number): void => {
    let startTimestamp: number;
    const range = end - start;

    function step(timestamp: number): void {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = timestamp - startTimestamp;
        const percentage = Math.min(progress / duration, 1);
        const current = start + Math.floor(percentage * range);
        if (current > 999 && el.dataset.numberScrollThousandsOff === undefined) {
            el.innerHTML = toThousands(current);
        } else {
            el.innerHTML = current.toString();
        }
        if (progress < duration) {
            globalThis.requestAnimationFrame(step);
        }
    }

    globalThis.requestAnimationFrame(step);
}

const NumberScrollDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding, _vnode: VNode): void {
        const { value } = binding;
        if (!el.innerHTML) {
            el.innerHTML = value.toString();
        }
        el.dataset.numberScrollValue = el.innerHTML;
    },
    updated(el: HTMLElement, binding: DirectiveBinding): void {
        if (el.dataset.numberScrollOnceExecuted) {
            return;
        }
        const { value } = binding;

        const oldValue = parseFloat(el.dataset.numberScrollValue ?? '0');
        const newValue = value ? parseFloat(value.toString()) : 0;
        const duration = parseInt(el.dataset.numberScrollDuration ?? '1000'); // 动画持续时间（毫秒）
        if (newValue != oldValue) {
            animateValue(el, oldValue ?? 0, value, duration);
            if (binding.modifiers.once) {
                el.dataset.numberScrollOnceExecuted = 'true';
            }
        }
        el.dataset.numberScrollValue = newValue.toString();
    },
};

// 注册全局指令
export default function install(app: App): void {
    app.directive('number-scroll', NumberScrollDirective);
}