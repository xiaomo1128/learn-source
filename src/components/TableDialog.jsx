import deepcopy from "deepcopy";
import { ElDialog, ElButton, ElTable, ElTableColumn, ElInput } from "element-plus";
import { createVNode, defineComponent, render, reactive } from "vue";


const TableComponent = defineComponent({
    props: {
        option: { type: Object }
    },
    setup( props, ctx ) {
        const state = reactive({
            option: props.option,
            isShow: false,
            editData: [], // 编辑的数据
        })
        
        let methods = {
            show(option) {
                state.option = option; // 把用户的配置缓存起来
                state.isShow = true; // 更改显示状态
                state.editData = deepcopy(option.data); // 通过渲染的数据 默认展现
            }
        }
        const add = () => {
            state.editData.push({})
        }
        const onCancel = () => {
            state.isShow = false;
        }
        const onConfirm = () => {
            state.option.onConfirm( state.editData )
            onCancel()
        }
        ctx.expose(methods);

        return () => {
            return (
                <ElDialog v-model={state.isShow} title={state.option.config.label}>
                    {{
                        default: () => (
                            <>
                                <div>
                                    <ElButton onClick={add}>添加</ElButton>
                                    <ElButton>重置</ElButton>
                                </div>
                                <ElTable data={state.editData}>
                                    <ElTableColumn type="index"></ElTableColumn>
                                    {state.option.config.table.options.map( (item,index) => {
                                        return (
                                            <ElTableColumn label={item.label}>
                                                {{
                                                    default: ({ row }) => (
                                                        <ElInput v-model={row[item.field]}></ElInput>
                                                    )
                                                }}
                                            </ElTableColumn>
                                        )
                                    })}
                                    <ElTableColumn label="操作">
                                        <ElButton type="danger">删除</ElButton>
                                    </ElTableColumn>
                                </ElTable>
                            </>
                        ),
                        footer: () => (
                            <>
                                <ElButton onClick={onCancel}>取消</ElButton>
                                <ElButton onClick={onConfirm}>确认</ElButton>
                            </>
                        )
                    }}
                </ElDialog>
            )
        }
    }
})

let vNode;
export const $tableDialog = (option) => {
    if ( !vNode ) {
        const el = document.createElement('div');
        vNode = createVNode( TableComponent, { option })
        let r = render(vNode, el)
        document.body.appendChild(el)
    }

    let { show } = vNode.component.exposed
    show(option)
}

