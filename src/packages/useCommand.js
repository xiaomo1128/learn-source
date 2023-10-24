import deepcopy from "deepcopy"
import { onUnmounted } from "vue"
import { evenets } from "./events"

export function useCommand (data, focusData) {
    // 前进后退需要指针
    const state = {
        current: -1, // 前进后退索引值
        queue: [], // 存放所有的操作命令
        commands: {}, // 制作命令和执行功能一个映射表 undo: () => {} redo: () => {}
        commandArray: [], // 存放所有命令
        destroyArray: [] // 销毁变量
    }

    const registry = (command) => {
        state.commandArray.push(command)
        // name 对应执行函数
        state.commands[command.name] = (...args) => {
            const { redo, undo } = command.execute(...args);
            redo()
            if ( !command.pushQueue ) {
                // 不需要放入队列中直接跳出
                return
            }
            let { queue, current } = state;

            if ( queue.length > 0 ) {
                // 可能在放置过程中有撤销操作，因此根据当前最新的current值来计算新的
                queue = queue.slice( 0, current + 1 ) 
                state.queue = queue
            }
            queue.push({ redo, undo }) // 保存指令的前进后退
            state.current = current + 1
            console.log('queue', queue);
        }
    }

    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    // 当前的上一步 执行还原操作
                    let item = state.queue[state.current+1];
                    if ( item ) {
                        item.redo && item.redo();
                        state.current++;
                    }
                }
            }
        }
    })

    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    if ( state.current == -1 ) return; // 
                    let item = state.queue[state.current];
                    if ( item ) {
                        // 没有操作队列
                        item.undo && item.undo(); 
                        state.current--;
                    }
                }
            }
        }
    })

    registry({
        name: 'drag',
        pushQueue: true,
        init() {
            this.before = null
            // 监控拖拽开始事件，保存状态
            const start = () => this.before = deepcopy(data.value.blocks);
            // 拖拽之后需要触发对应的指令
            const end = () => state.commands.drag();
            evenets.on('start', start);
            evenets.on('end', end);
            return () => {
                evenets.off('start', start)
                evenets.off('end', end)
            }
        },
        execute() {
            let before = this.before
            let after = data.value.blocks // 之后的状态
            return {
                redo() {
                    // 默认一松手，就直接把当前事件触发
                    data.value = { ...data.value, blocks: after }
                },
                undo() {
                    // 上一操作步骤
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    });

    // 带有历史记录的常用模式
    registry({
        name: 'updateContainer', // 更新整个容器
        pushQueue: true,
        execute(newV) {
            let state = {
                before: data.value, // 当前的值
                after: newV // 最新的值
            }
            return {
                // 重做
                redo: () => {
                    data.value = state.after
                }, 
                // 撤回
                undo: () => {
                    data.value = state.before
                }
            }
        }
    })

    registry({
        name: 'updateBlock', // 更新某个组件
        pushQueue: true,
        execute( newBlock, oldBlock ) {
            let state = {
                before: data.value.blocks,
                after: (()=>{
                    // 复制一份 用于新的block
                    let blocks = [ ...data.value.blocks ];
                    // 寻找旧的
                    const index = data.value.blocks.indexOf( oldBlock );
                    if ( index > -1 ) {
                        blocks.splice( index, 1, newBlock );
                    }
                    return blocks
                })()
            }

            return {
                redo: () => {
                    data.value = { ...data.value, blocks: state.after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: state.before }
                }
            }
        }
    })

    // 置顶操作
    registry({
        name: 'placeTop', 
        pushQueue: true,
        execute () {
            let before = deepcopy(data.value.blocks)

            // 置顶就是 在所有block中找到最大的
            let after = (()=>{
                let { focus, unfocus } = focusData.value
                
                let maxZIndex = unfocus.reduce((prev, block)=> {
                    return Math.max(prev, block.zIndex);
                }, -Infinity)

                // 让当前选中的 比 最大的 +1 即可
                focus.forEach( block => block.zIndex = maxZIndex + 1 );
                return data.value.blocks
            })()
            return {
                // 撤回
                undo: () => {
                    // 若blocks 前后一致，则不会更新
                    data.value = { ...data.value, blocks: before }
                }, 
                // 重做
                redo: ()=> {
                    data.value = { ...data.value, blocks: after }
                }
            }
        }
    })

    // 置底操作
    registry({
        name: 'placeBottom',
        pushQueue: true,
        execute() {
            let before = deepcopy(data.value.blocks)

            let after = (()=>{
                let { focus, unfocus } = focusData.value;
                let minZIndex = unfocus.reduce(( prev, block ) =>  {
                    return Math.min(prev, block.zIndex)
                }, Infinity) - 1;
                // 不能直接 -1 因为index 不能出现负值，负值就看不到组件了
                // 让其他的模块 +1 ，选中的模块不做减法
                if ( minZIndex < 0 ) {
                    // 若是负数，则让没选中的向上，自己变成0
                    const dur = Math.abs( minZIndex );
                    minZIndex = 0;
                    unfocus.forEach( block => block.zIndex += dur ); 
                }
                focus.forEach( block => block.zIndex = minZIndex );
                return data.value.blocks
            })()

            return {
                undo: () => {
                    data.value = { ...data.value, blocks: before }
                },
                redo: () => {
                    data.value = { ...data.value, blocks: after }
                }
            }
        }
    })
    
    // 删除操作
    registry({
        name: 'delete', 
        pushQueue: true,
        execute() {
            let state = {
                before: deepcopy(data.value.blocks), // 当前的值
                after: focusData.value.unfocus // 删除选中的，余下的是没选中的
            }
            return {
                redo: () => {
                    data.value = { ...data.value, blocks: state.after }
                },
                undo: () => {
                    data.value = { ...data.value, blocks: state.before }
                }
            }
        }
    })

    const keyboardEvent = (()=>{
        const keyCodes = {
            90: 'z',
            89: 'y'
        }
        const onKeydown = (e) => {
            const { ctrlKey, keyCode } = e; // ctrl+z / ctrl+y
            let keyString = []
            if ( ctrlKey ) keyString.push('ctrl');
            keyString.push( keyCodes[keyCode] );
            keyString = keyString.join('+');

            state.commandArray.forEach( ({ keyboard, name }) => {
                if ( !keyboard ) return; // 没有键盘事件
                if ( keyboard === keyString ) {
                    e.preventDefault();
                    state.commands[name]();
                }
            })
        }
        // 事件初始化
        const init = () => {
            window.addEventListener('keydown', onKeydown );
            return () => {
                // 销毁事件
                window.removeEventListener('keydown', onKeydown )
            }
        }
        return init
    })();
    ;(()=>{
        // 监听键盘事件
        state.destroyArray.push(keyboardEvent())
        state.commandArray.forEach( command => command.init && state.destroyArray.push(command.init()))
    })()

    // 清空绑定的事件
    onUnmounted(() => {
        state.destroyArray.forEach( fn => fn && fn() )
    })
    return state
}