import { reactive } from "vue";
import { evenets } from "./events";

export function useBlockDragger (focusData, lastSelectBlock, data) {
    let dragState = {
        startX: 0,
        startY: 0,
        dragging: false // 默认不是正在拖拽
    }

    // 坐标线 - 具有响应式
    let markLine = reactive({
        x: null,
        y: null
    })

    const mousedown = (e) => {
        const { width: BWidth, height: BHeight } = lastSelectBlock.value
        
        dragState = {
            dragging: false, // 是否拖拽中
            startX: e.clientX,
            startY: e.clientY, // 记录每一个选中的位置
            startLeft: lastSelectBlock.value.left, // b点拖拽前left的位置
            startTop: lastSelectBlock.value.top, // b点拖拽前top的位置
            startPos: focusData.value.focus.map( ({ top, left }) => ({ top, left })),
            lines: (()=>{
                const { unfocus } = focusData.value;
                let lines = { x: [], y: [] }; // 计算横线的位置用y存放，x存放纵向
                [...unfocus, 
                    { 
                        top: 0,
                        left: 0, 
                        width: data.value.container.width, 
                        height: data.value.container.height 
                    }
                ].forEach( (block) => {
                    const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = block
                    // 纵向-辅助线显示
                    lines.y.push({ showTop: ATop, top: ATop }) // 顶对顶
                    lines.y.push({ showTop: ATop, top: ATop - BHeight}) // 顶对底
                    lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 }) // 中对中 
                    lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }) // 底对顶
                    lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight }) // 底对底

                    // 横向-辅助线显示
                    lines.x.push({ showLeft: ALeft, left: ALeft }) // 左对左
                    lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }) // 左对右
                    lines.x.push({ showLeft: ALeft + AWidth /2 , left: ALeft + AWidth /2 - BWidth /2 }) // 中对中
                    lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth }) // 右对右
                    lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }) // 左对右
                })
                return lines
            })()
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }

    const mousemove = (e) => {
        let { clientX: moveX, clientY: moveY } = e

        if ( !dragState.dragging ) {
            dragState.dragging = true;
            evenets.emit('start'); // 触发事件 记录拖拽前的位置
        }

        // 计算当前元素最新的left和top 在lines中找，
        // 鼠标移动后 - 鼠标移动前 + left 
        let left = moveX - dragState.startX + dragState.startLeft;
        let top = moveY - dragState.startY + dragState.startTop;
        // 先计算横线 距离参照物元素还有5px 显示这根线
        let y = null
        let x = null
        for ( let i = 0; i < dragState.lines.y.length; i++) {
            const { top: t, showTop: s } = dragState.lines.y[i] // 获取每一根线
            if ( Math.abs(t-top) < 5 ) { 
                // 小于5px
                y = s // 纵线 - 显示的位置
                moveY = dragState.startY - dragState.startTop + t // 容器距离顶部的距离 + 目标高度 = 最新moveY
                // 实现快速和A元素贴在一起
                break; // 找到对应显示线后跳出循环
            }
        }

        for ( let i = 0; i < dragState.lines.x.length; i++ ) {
            const { left: l, showLeft: s } = dragState.lines.x[i] // 获取每一根线
            if ( Math.abs(l-left) < 5 ) {
                // 小于5px
                x = s // 横线 - 显示的位置
                moveX = dragState.startX - dragState.startLeft + l // 容器距离左侧的距离 + 目标左侧间距 = 最新moveX
                // 实现快速与 A元素贴在一起
                // 找到对应显示线后跳出循环
                break;
            }
        }
        markLine.x = x // 实现坐标显示线 - 有响应式
        markLine.y = y

        let durX = moveX - dragState.startX
        let durY = moveY - dragState.startY
        focusData.value.focus.forEach( (block, idx) => {
            block.top = dragState.startPos[idx].top + durY
            block.left = dragState.startPos[idx].left + durX
        })

    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
        markLine.x = null
        markLine.y = null
        if ( dragState.dragging ) {
            // 若只是点击不会触发 move才触发
            evenets.emit('end')
        }
    }

    return {
        mousedown, 
        markLine
    }
}