import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from "./editor-block.jsx";
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger.js";
import { useFocus } from "./useFocus.js";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";
import { $dropdown, DropdownItem } from "@/components/Dropdown";
import EditorOperator from './editor-operator'
import { ElButton } from "element-plus";

export default defineComponent({
    props: {
        modelValue: {
            type: Object
        },
        formData: { type: Object }
    },
    emits: ['update:modelValue'], // 触发事件
    setup(props, ctx) {
        // 预览时 内容不能操作，可以点击输入
        const previewRef = ref(false); 
        const editorRef = ref(true);

        const data = computed({
            get() {
                return props.modelValue
            },
            set( newV ) {
                ctx.emit('update:modelValue', deepcopy(newV))
            }
        })

        const containerStyle = computed( () => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config')

        const containerRef = ref(null)
        // 实现菜单拖拽功能
        const { dragstart, dragend } = useMenuDragger( containerRef, data)

        // 实现获取焦点        
        const { containerMousedown, focusData, blockMousedown, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => {
            mousedown(e)
        })
        // 选中后可能直接进行拖拽
        let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data)

        // 顶部菜单栏
        const { commands } = useCommand(data, focusData)
        const buttons = [
            { label: '撤销', icon: 'icon-back', handler: () => commands.undo() },
            { label: '重做', icon: 'icon-forward', handler: () => commands.redo() },
            { label: '导出', icon: 'icon-export', handler: () => {
                $dialog({
                    title: '导出json使用',
                    content: JSON.stringify(data.value),
                    footer: false 
                })
            } },
            { label: '导入', icon: 'icon-import', handler: () => {
                $dialog({
                    title: '导入json使用',
                    content: '', 
                    footer: true,
                    onConfirm(text) {
                        // data.value = JSON.parse(text);// 这方式更改，无法保留历史记录
                        commands.updateContainer(JSON.parse(text));
                    }
                })
            } },
            { label: '置顶', icon: 'icon-place-top', handler: () => commands.placeTop() },
            { label: '置底', icon: 'icon-place-bottom', handler: () => commands.placeBottom() },
            { label: '删除', icon: 'icon-delete', handler: () => commands.delete() },
            { label: () => previewRef.value ? '编辑' : '预览', icon: ()=> previewRef.value ? 'icon-edit' : 'icon-browse', handler: () => { previewRef.value = !previewRef.value; clearBlockFocus(); } },
            { label: '关闭', icon: 'icon-close', handler: () => {
                editorRef.value = false;
                clearBlockFocus();
            }},
        ]

        const onContextMenuBlock = ( e, block ) => {
            e.preventDefault();
            console.log('onContextMenuBlock', block);
            $dropdown({
                el: e.target, // 鼠标右键点击的元素 产生一个dropdown
                content: () => (
                    <>
                        <DropdownItem label="删除" icon="icon-delete" onClick={ ()=> commands.delete() }></DropdownItem>
                        <DropdownItem label="置顶" icon="icon-place-top" onClick={ ()=> commands.placeTop() }></DropdownItem>
                        <DropdownItem label="置底" icon="icon-place-bottom" onClick={ ()=> commands.placeBottom() }></DropdownItem>
                        <DropdownItem label="查看" icon="icon-browse" onClick={()=>{
                            $dialog({
                                title: '查看节点数据',
                                content: JSON.stringify(block)
                            })
                        }}></DropdownItem>
                        <DropdownItem label="导入" icon="icon-import" onClick={()=>{
                            $dialog({
                                title: '导入节点数据',
                                content: '',
                                footer: true,
                                onConfirm( text ) {
                                    text = JSON.parse(text)
                                    commands.updateBlock(text, block)
                                }
                            })
                        }}></DropdownItem>
                    </>
                ) 
            })
        }

        return ()=> ( !editorRef.value ? 
            (
                <div>
                    <div ref={containerRef} class="editor-container-canvas__content" style={editorRef.value ? containerStyle.value : {...containerStyle.value, margin: 0} }>
                        {
                            (data.value.blocks.map( (block,index) => (
                                <EditorBlock class="editor-block-preview" block={block} formData={props.formData}></EditorBlock>
                            )))
                        }
                    </div>
                    <div><ElButton type="primary" onClick={() => editorRef.value = true }>继续编辑</ElButton>{JSON.stringify(props.formData)}</div>
                </div>
            ) : (   
                <div class="editor">
                    <div class="editor-left">
                        {/* 根据注册列表 渲染对应内容 */}
                        { config.componentList.map( component => (
                            <div className="editor-left-item" draggable="true" onDragstart={e => dragstart(e, component)} onDragend={dragend}>
                                <span>{ component.label }</span>
                                <div>{ component.preview() }</div>
                            </div>
                        ))}
                    </div>
                    <div class="editor-top">
                        {
                            buttons.map( ( btn ,index ) => {
                                const icon = typeof btn.icon == 'function' ? btn.icon() : btn.icon;
                                const label = typeof btn.label == 'function' ? btn.label() : btn.label;
                                return <div class="editor-top-button" onClick={btn.handler}>
                                    <i class={icon}></i>
                                    <span>{label}</span>
                                </div>
                            })
                        }
                    </div>
                    <div class="editor-right">
                        <EditorOperator block={lastSelectBlock.value} data={data.value} updateContainer={commands.updateContainer} updateBlock={commands.updateBlock}></EditorOperator>
                    </div>
                    <div class="editor-container">
                        {/* 产生滚动条 */}
                        <div class="editor-container-canvas">
                            {/* 内容区域 */}
                            <div ref={containerRef} class="editor-container-canvas__content" style={containerStyle.value} onMousedown={containerMousedown}>
                                {
                                    (data.value.blocks.map( (block,index) => (
                                        <EditorBlock class={ previewRef.value ? 'editor-block-preview'  : (block.focus ? 'editor-block-focus' : '') } block={block} onMousedown={(e) => blockMousedown(e, block, index)} onContextmenu={(e) => onContextMenuBlock(e, block) } formData={props.formData}></EditorBlock>
                                    )))
                                }
                                { markLine.x !== null && (<div class="line-x" style={{ left: markLine.x +'px'}}></div>)}
                                { markLine.y !== null && (<div class="line-y" style={{ top: markLine.y +'px'}}></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    }
})
