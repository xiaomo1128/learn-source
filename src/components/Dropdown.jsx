import { provide, inject, createVNode, defineComponent, render, reactive, computed, onMounted, ref, onBeforeUnmount } from "vue";

export const DropdownItem = defineComponent({
    props: {
        label: String,
        icon: String
    },
    setup(props) {
        let { label, icon } = props
        let hide = inject('hide')

        return () => (
            <div class="dropdown-item" onClick={hide}>
                <i class={ icon }></i>
                <span>{ label }</span>
            </div>
        )
    }
})

const DropdownComponent = defineComponent({
    props: {
        option: {
            type: Object
        },
    },
    setup( props, ctx ) {
        const state = reactive({
            option: props.option,
            isShow: false,
            top: 0,
            left: 0,
        });
        ctx.expose({
            showDropdown(option) {
                state.option = option;
                state.isShow = true;
                let { top, left, height } = option.el.getBoundingClientRect();
                state.top = top + height;
                state.left = left;
            }
        });
        provide('hide', () => state.isShow = false )

        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isShow': state.isShow
            }
        ])
        const styles = computed(()=> ({
            top: state.top + 'px',
            left: state.left + 'px'
        }))

        const el = ref(null)
        const onMousedownDocument = (e) => {
            if ( !el.value.contains(e.target)) {
                state.isShow = false
            }
        }

        onMounted(()=> {
            // 事件传递行为是先捕获  后冒泡
            // 之前为了阻止事件传播  给block 增加了stopPropagation
            document.body.addEventListener('mousedown',onMousedownDocument , true)
        })

        onBeforeUnmount(()=> {
            document.body.removeEventListener('mousedown', onMousedownDocument)
        })

        return () => {
            return (
                <div class={classes.value} style={styles.value} ref={el}>
                    { state.option.content() }
                </div>
            )
        }
    }
})

let vNode;
export function $dropdown(option) {
    if ( !vNode ) {
        let el = document.createElement('div');
        // 渲染成虚拟节点
        vNode = createVNode( DropdownComponent ,{ option });
        // 渲染成真实节点，挂载到页面上
        document.body.appendChild( (render( vNode, el), el));
    }
    // 将组件渲染到el元素上
    let { showDropdown } = vNode.component.exposed;
    showDropdown(option);
}
