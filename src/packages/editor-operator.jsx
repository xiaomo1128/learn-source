import { defineComponent, inject, reactive, watch } from "vue";
import { ElForm, ElFormItem, ElButton, ElInputNumber, ElInput, ElColorPicker, ElSelect, ElOption } from "element-plus";
import deepcopy from "deepcopy";
import TableEditor from "./table-editor";

export default defineComponent({
    props: {
        // 用户最后选中的元素
        block: {
            type: Object
        },
        // 当前所有数据
        data: {
            type: Object
        },
        updateContainer: {
            type: Function
        },
        updateBlock: {
            type: Function
        }
    },
    setup ( props, ctx ) {
        // 导入组件配置信息
        const config = inject('config')
        const state = reactive({
            editData: {}
        })
        const reset = () => {
            // 要绑定的是 容器 的宽度+高度
            if ( !props.block ) {  
                state.editData = deepcopy(props.data.container)
            } else {
                // 不是容器
                state.editData = deepcopy(props.block)
            }
        }
        const apply = () => {
            if (!props.block) {
                // 更改组件容器大小
                props.updateContainer({ ...props.data, container: state.editData })
            } else {
                props.updateBlock( state.editData, props.block )
            }
        }
        watch(()=> props.block, reset, { immediate: true })

        return () => {
            let content = []
            if ( !props.block ) {
                content.push(
                    <>
                        <ElFormItem label="容器宽度">
                            <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                        </ElFormItem>
                        <ElFormItem label="容器高度">
                            <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                        </ElFormItem>
                    </>
                )
            } else {
                let component = config.componentMap[props.block.key]
                if ( component && component.props ) {
                    content.push(
                        Object.entries( component.props ).map( ([ propName, propConfig ]) => {
                            return (
                                <ElFormItem label={propConfig.label}>
                                    {{
                                        input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                                        color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                                        select: () => (
                                            <ElSelect v-model={state.editData.props[propName]}>
                                                {
                                                    propConfig.options.map( opt => {
                                                        return (
                                                            <ElOption label={opt.label} value={opt.value}></ElOption>
                                                        )
                                                    })
                                                }
                                            </ElSelect>
                                        ),
                                        table: () => (<TableEditor propConfig={propConfig} v-model={state.editData.props[propName]}></TableEditor>)
                                    }[propConfig.type]() }
                                </ElFormItem>
                            )
                        })
                    )
                }

                if ( component && component.model ) {
                    content.push(
                        // modelName  相当于 default
                        // label 标签名
                        Object.entries( component.model ).map( ([ modelName, label]) => {
                            return (
                                <ElFormItem label={label}>
                                    <ElInput v-model={state.editData.model[modelName]}></ElInput>
                                </ElFormItem>
                            )
                        })
                    )
                }
            }
            
            return (
                <ElForm labelPosition="top" style="padding: 30px;">
                    { content }
                    <ElFormItem>
                        <ElButton type="primary" onClick={() => apply()}>应用</ElButton>
                        <ElButton onClick={reset}>重置</ElButton>
                    </ElFormItem>
                </ElForm>
            )
        }
    }
})
