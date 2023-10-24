import { evenets } from "./events";

export function useMenuDragger ( containerRef, data ) {
    let currentComponent = null
    const dragenter = ( e ) => {
        e.dataTransfer.dropEffect = 'move'; // h5拖动图标
    }
    const dragover = ( e ) => {
        e.preventDefault()
    }
    const dragleave = ( e ) => {
        e.dataTransfer.dropEffect = 'none'
    }
    const drop = ( e ) => {
        let blocks = data.value.blocks // 内部已渲染的组件
        data.value = {
            ...data.value,
            blocks: [
                ...blocks,
                {
                    top: e.offsetY,
                    left: e.offsetX,
                    zIndex: 1,
                    key: currentComponent.key,
                    alignCenter: true, // 当松手时 居中
                    props: {}, // 配置信息
                    model: {}, // 
                }
            ]
        }
        currentComponent = null
    }
    const dragstart = (e, component) => {
        containerRef.value.addEventListener('dragenter', dragenter)
        containerRef.value.addEventListener('dragover', dragover)
        containerRef.value.addEventListener('dragleave', dragleave)
        containerRef.value.addEventListener('drop', drop)
        currentComponent = component
        evenets.emit('start') // 拖拽前发布订阅 start
    }

    const dragend = (e) => {
        containerRef.value.removeEventListener('dragenter', dragenter)
        containerRef.value.removeEventListener('dragover', dragover)
        containerRef.value.removeEventListener('dragleave', dragleave)
        containerRef.value.removeEventListener('drop', drop)
        evenets.emit('end') // 结束时发布订阅 end
    }

    return {
        dragstart,
        dragend
    }
}