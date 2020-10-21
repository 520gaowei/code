class Vue extends EventTarget{
    constructor(opts){
        super();
        this.opts = opts;
        this._data = opts.data;
        this.observe(this._data);
        this.compile(opts.el);
    }
    observe(data){
        let keys = Object.keys(data);
        keys.forEach(key=>{
            let value = data[key];
            let dep = new Dep();
            Object.defineProperty(data,key,{
                configurable:true,
                enumerable:true,
                get(){
                    // 收集订阅者；
                  console.log("get。。。");
					console.log("Dep.target:"+Dep.target);
                    if(Dep.target){
                        // Dep.traget --->this -->wathcher
                        dep.addSub(Dep.target);
                    }
                    
                    // dep.addSub();
                    return value;
                },
                set:newValue=>{
                    console.log("set。。。");
                    // //触发自定义事件编译视图；
                    // this.dispatchEvent(new CustomEvent(key,{
                    //     detail:newValue
                    // }))
                    // 发布--》触发update
                    console.log(dep);
                    dep.notify(newValue);
                    value = newValue;
                }
            })
        })
    }
    compile(el){
        let ele = document.querySelector(el);
        this.compileNodes(ele);
    }
    compileNodes(ele){
        let childNodes = ele.childNodes;
        // console.log(childNodes);
        childNodes.forEach(node=>{
            if(node.nodeType===1){
                let attrs = node.attributes;
                [...attrs].forEach(attr=>{
                    let attrName = attr.name;
                    let attValue = attr.value;
					//console.log("attrName:"+attrName)
					//console.log("attValue:"+attValue)
                    if(attrName==="v-model"){
                        node.value = this._data[attValue];
                        node.addEventListener("input",e=>{
                            // console.log(e.target.value);
                            // 触发set
                            this._data[attValue] = e.target.value;
                        })
                    }
					if(attrName==="v-html"){
						// 作业实现 v-html方法；
						// 暗号：空调
						node.innerHTML = this._data[attValue];	
					}
                })

                if(node.childNodes.length>0){
                    this.compileNodes(node);
                }
            }else if(node.nodeType===3){
                // console.log("文本");
                let textContent = node.textContent;
                // console.log(textContent);
                // 查找特殊大胡子语法；
                let reg =  /\{\{\s*([^\{\}]+)\s*\}\}/g;
                // new RegExp();
            // Promise.resolve()
                // console.log(reg.$1)
                if(reg.test(textContent)){
                    // console.log("有大胡子语法");
                    let $1 = RegExp.$1;
                    // 人为触发get 来收集 watcher
                    new Watcher(this._data,$1,(newValue)=>{
                        console.log("更新了。。。",newValue);
                        let oldValue = this._data[$1];
                        let reg = new RegExp(oldValue,"g");
                        node.textContent  = node.textContent.replace(reg,newValue);
                    });


                }
            }
        })

    }
}

// 管理器
class Dep{
    constructor(){
        this.subs = [];
    }
    // 收集订阅者
    addSub(sub){
        this.subs.push(sub);
    }
    // 发布
    notify(newValue){
        this.subs.forEach(sub=>{
            sub.update(newValue);
        })
    }
}

// 订阅者；
class Watcher{
    constructor(data,key,cb){
        // console.log("watcher")
        this.cb = cb;
        // 先定义 watcher实例this  然后在收集watcher
        Dep.target = this;
        data[key]; //触发get 收集watcher；
        Dep.target = null;
    }
    update(newValue){
        // console.log("更新了");
        this.cb(newValue);
    }
}

// 作业实现 v-html方法；
// 暗号：空调
