export function useBlockDragger (focusData) {
    let dragState = {
        stratX: 0,
        stratY: 0
    }
    const mousemove = (e) => {
        let { clientX: moveX, clientY: moveY } = e
        let durX = moveX - dragState.stratX
        let durY = moveY - dragState.stratY
        focusData.value.focus.forEach( (block, idx) => {
            block.top = dragState.startPos[idx].top + durY
            block.left = dragState.startPos[idx].left + durX
        })

    }
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
    }
    const mousedown = (e) => {
        dragState = {
            stratX: e.clientX,
            stratY: e.clientY,
            startPos: focusData.value.focus.map( ({ top, left }) => ({ top, left }))
        }
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
    }

    return {
        mousedown
    }
}