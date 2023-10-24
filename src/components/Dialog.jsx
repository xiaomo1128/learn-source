import { ElDialog, ElInput, ElButton } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";


const DialogComponent = defineComponent({
    props: {
        option: {
            type: Object
        }
    },
    setup({ option }, ctx ) {
        const state = reactive({
            option, // 用户给组件的属性
            isShow: false
        })
        ctx.expose({
            // 让外界可以调用组件的方法
            showDialog(option) {
                state.option = option
                state.isShow = true
            }
        })
        const onCancel = () => {
            state.isShow = false
        }
        const onConfirm = () => {
            state.isShow = false
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }

        return () => {
            return <ElDialog v-model={state.isShow} title={state.option.title}>
                {{
                    default: () => <ElInput type="textarea" v-model={state.option.content} rows={10}></ElInput>,
                    footer: ()=> state.option.footer && <div>
                        <ElButton onClick={onCancel}>取消</ElButton>
                        <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
                    </div>
                }}
            </ElDialog>
        }
    }
})

let vNode;
export function $dialog(option) {
    // 防止渲染多个vNode
    if ( !vNode ) {
        let el = document.createElement('div');
        // 将组件渲染成虚拟节点
        vNode = createVNode( DialogComponent, { option }); 
        // 渲染成真实node在页面显示
        document.body.appendChild( (render( vNode, el ), el) );
    }

    // 若该组件已被渲染过，只需要show出来即可
    // 将组件渲染到el元素上
    let { showDialog } = vNode.component.exposed;
    showDialog(option);
}
