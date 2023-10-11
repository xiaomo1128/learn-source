import { computed } from "vue"

export function useFocus (data, callback) {
    // 实现拖拽多个元素功能
    const focusData = computed(() => {
        let focus = []
        let unfocus = []
        data.value.blocks.forEach( block => (block.focus ? focus : unfocus).push(block) )
        return {
            focus,
            unfocus
        }
    })

    // 清除已选中的模块
    const clearBlockFocus = () => {
        data.value.blocks.forEach( block => block.focus = false )
    }
    const blockMousedown = ( e, block ) => {
        e.preventDefault()
        e.stopPropagation()
        if ( e.ctrlKey ) {
            block.focus = !block.focus
        } else {
            if (!block.focus) {
                // 清空其他已选中的focus属性
                clearBlockFocus()
                // 选中焦点
                block.focus = true
            } else {
                block.focus = false
            }
        }
        callback(e)
    }

    // 点击内容区域，重置已选中项
    const containerMousedown = (e) => {
        e.preventDefault()
        e.stopPropagation()
        clearBlockFocus()
    }

    return {
        blockMousedown,
        containerMousedown,
        focusData
    }
}