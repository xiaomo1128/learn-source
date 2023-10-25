import { defineComponent } from "vue";


export default defineComponent({
    props:{
        block: { type: Object },
        component: { type: Object }
    },
    setup( props, ctx ) {
        const {width, height} = props.component.resize || {};
        let data = {}

        const onmousemove = (e) => {
            let { clientX, clientY } = e;
            let { startX, startY, startWidth, startHeight, startLeft, startTop, direction } = data;

            if (direction.horizontal == 'center') {
                // 拖拽的是中间点  x轴不变
                clientX = startX
            }
            if (direction.vertival == 'center') {
                // 只能改横向 纵向不发生改变
                clientY = startY
            }

            let durX = clientX - startX;
            let durY = clientY - startY;

            // 针对反向拖拽点位 需要取反，拿到正确的组件top+left
            if (direction.vertival == 'start') {
                durY = -durY;
                props.block.top = startTop - durY;
            }
            if (direction.horizontal == 'start') {
                durX = -durX;
                props.block.left = startLeft - durX;
            }

            const width = startWidth + durX;
            const height = startHeight + durY;

            // 拖拽时，改变宽高
            props.block.width = width;
            props.block.height = height; 
            props.block.hasResize = true;
        }
        const onmouseup = () => {
            document.body.removeEventListener('mousemove', onmousemove);
            document.body.removeEventListener('mouseup', onmouseup);
        }
        const onmousedown = (e, direction) => {
            e.stopPropagation();
            data = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth: props.block.width,
                startHeight: props.block.height,
                startLeft: props.block.left,
                startTop: props.block.top,
                direction,
            }
            document.body.addEventListener('mousemove', onmousemove);
            document.body.addEventListener('mouseup', onmouseup);
        }
        return () => (
            <>
                {
                    width && <>
                        <div class="block-resize block-resize-left" onMousedown={ e => onmousedown(e, { horizontal: 'start', vertival: 'center' })}></div>
                        <div class="block-resize block-resize-right" onMousedown={ e => onmousedown(e, { horizontal: 'end', vertival: 'center' })}></div>
                    </>
                }
                {
                    height && <>
                        <div class="block-resize block-resize-top" onMousedown={ e => onmousedown(e, { horizontal: 'center', vertival: 'start' })}></div>
                        <div class="block-resize block-resize-bottom" onMousedown={ e => onmousedown(e, { horizontal: 'center', vertival: 'end' })}></div>
                    </>
                }
                {
                    width && height && <>
                        <div class="block-resize block-resize-top-left" onMousedown={ e => onmousedown(e, { horizontal: 'start', vertival: 'start' })}></div>
                        <div class="block-resize block-resize-top-right" onMousedown={ e => onmousedown(e, { horizontal: 'end', vertival: 'start' })}></div>
                        <div class="block-resize block-resize-bottom-left" onMousedown={ e => onmousedown(e, { horizontal: 'start', vertival: 'end' })}></div>
                        <div class="block-resize block-resize-bottom-right" onMousedown={ e => onmousedown(e, { horizontal: 'end', vertival: 'end' })}></div>
                    </>
                }
            </>
        )
    }
})
