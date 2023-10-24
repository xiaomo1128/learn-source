import { computed, ref } from "vue"

export function useFocus (data, previewRef, callback) {
    const selectIndex = ref(-1) // 表示没有任何一个被选中
    // 找出最后选中的模块
    const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]) 

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
    const blockMousedown = ( e, block, index ) => {
        if ( previewRef.value ) return; // 预览时不能触发
        e.preventDefault()
        e.stopPropagation()
        if ( e.ctrlKey ) {
            if ( focusData.value.focus.length <= 1 ) {
                // 当只有一个节点被选中时，按下ctrl键 不会切换focus状态
                block.focus = true 
            } else {
                block.focus = !block.focus
            }
        } else {
            // 当已被选中，再次点击仍是选中状态
            if (!block.focus) {
                // 清空其他已选中的focus属性
                clearBlockFocus()
                // 选中焦点
                block.focus = true
            } 
        }
        selectIndex.value = index
        callback(e)
    }

    // 点击内容区域，重置已选中项
    const containerMousedown = (e) => {
        if ( previewRef.value ) return;// 预览时不能触发
        e.preventDefault();
        e.stopPropagation();
        clearBlockFocus(); // 清除选中
        selectIndex.value = -1
    }

    return {
        blockMousedown,
        containerMousedown,
        focusData,
        lastSelectBlock,
        clearBlockFocus
    }
}