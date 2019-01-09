<template xmlns:>
  <div class="container-home" :class="{noAside:!isShowAside}">
    <aside>
      <button class="btn-toggle"
              @click="isShowAside = !isShowAside"
              :class="{open:!isShowAside,close:isShowAside}">
      </button>
      <h1 class="title" @click="loadComponent">VOB Component</h1>
      <ul class="list-project">
        <li class="item-project"
            :class="{current: component.id === currentId}"
            v-for="(component,index) in components"
            @click="loadCode(component.id)">
          <el-popover
            placement="top-start"
            width="220"
            trigger="hover">
            <div style="cursor: pointer">
              <div>{{component.content}}</div>
            </div>
            <div slot="reference" style="padding-left: 8px; line-height: 1;">{{component.name}}</div>
            </el-popover>
          <img src="../assets/image/icon-to.png"
               class="btn-share" alt="添加" @click="addComponent(component)">
        </li>
      </ul>
      <button class="btn-add" @click="loadComponent"></button>
    </aside>
    <div class="box-editor">
      <div class="box-code"
           :style="{height: boxCodeHeight + 'px'}">
        <textarea
          spellcheck="false"
          autocapitalize="none"
          autocorrect="off"
          ref="codeEditor" style="background-color: #0C1021;height: 1px; width: 1px;">
        </textarea>
      </div>
      <div class="box-control">
        <a class="link-site" href="http://code.smallcfj.club" target="_blank">Javascript Box</a>
        <div class="box-right">
          <label class="text-title">{{currentTitle}}</label>
          <button class="btn-save" v-clipboard:copy="scripts" v-clipboard:success="onCopy" v-clipboard:error="onError">复制代码</button>
          <button class="btn-save" @click="componentVisible = true" style="width: auto;">保存为模板</button>
          <button @click="clearConsole()">清空</button>
          <button @click="run()">语法检查</button>
        </div>
      </div>
      <div class="box-console">
        <ul class="list-console">
          <li class="item-console" v-for="dc in dataConsole">
            <label>{{$util.parseDate(dc.time,'yyyy-MM-dd hh:mm:ss')}}&nbsp;&nbsp;:&nbsp;&nbsp;</label>
            {{dc.msg}}
          </li>
        </ul>
      </div>
    </div>
    <el-dialog
      title="添加代码块"
      :visible.sync="dialogVisible"
      width="50%">
      <el-row>
        <el-col :span="12"><el-input v-model="scriptResult" type="textarea" :readonly="true" autosize></el-input></el-col>
        <el-col :span="12">
          <el-form :model="selectedComponent" class="demo-dynamic" label-width="40px">
            <el-form-item v-for="param in selectedComponent.params" :item="param">
              <el-row>
                <el-col :span="6">{{param.name}}</el-col>
                <el-col :span="18">
                  <el-input v-model="param.value" type="textarea" autosize></el-input>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item style="text-align: center">
              <el-button @click="dialogVisible = false" size="small">取消</el-button>
              <el-button type="primary" @click="sureAddScripts(selectedComponent)" size="small">添加</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>

    <el-dialog
      title="模板信息[#{XXX}元素为可替换变量]"
      :visible.sync="componentVisible"
      width="30%" v-if="editor">
      <el-form :model="newComponent" ref="newComponent" class="demo-dynamic" label-width="80px">
        <el-form-item label="模板名字" :rules="[{required: true, message: '模板名不能为空',trigger: 'blur'}]">
          <el-input v-model="newComponent.name"></el-input>
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input v-model="newComponent.description" type="textarea" autosize></el-input>
        </el-form-item>
        <el-form-item label="模板内容" :rules="[{required: true, message: '模板内容不能为空'}]">
          <el-input v-model="editor.getValue()" type="textarea" :readonly="true" autosize></el-input>
        </el-form-item>
        <el-form-item style="text-align: center">
          <el-button @click="componentVisible = false" size="small">取消</el-button>
          <el-button type="primary" @click="saveAsComponent(newComponent)" size="small">添加</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import CodeMirror from '../assets/CodeMirror/lib/codemirror'
  import '../assets/CodeMirror/mode/javascript'
  import '../assets/CodeMirror/addon/hint/show-hint'
  import '../assets/CodeMirror/addon/hint/show-hint.css'
  import '../assets/CodeMirror/addon/hint/javascript-hint'
  import popSave from './popSave.vue'
  import popAlert from './popAlert.vue'
  import popShare from './popShare.vue'
  export default {
    components: {
      'pop-save': popSave,
      'pop-alert': popAlert,
      'pop-share': popShare
    },
    data: function () {
      return {
        editor: null,
        dataConsole: [],
        components: [],
        preY: 0,
        boxCodeHeight: 600,
        currentId: '',
        currentTitle: '',
        isShowAside: true,
        popSaveOpen: false,
        shareCodeId: '',
        dialogVisible: false,
        componentVisible: false,
        selectedComponent: {params: []},
        newComponent: {name: null, description: null}
      }
    },
    computed: {
      scriptResult: function () {
        const selectedComponent = this.selectedComponent
        let content = selectedComponent.content
        let scriptResult = content
        if (content) {
          selectedComponent.params.map(param => {
            let reg = new RegExp('#{\\s{0,}' + param.name + '\\s{0,}}', 'g')
            let value = param.value
            if (value != null && value.trim().length > 0) {
              scriptResult = scriptResult.replace(reg, param.value)
            }
          })
        }
        return scriptResult + '\n'
      },
      scripts: function () {
        return this.editor ? this.editor.getValue().trim() : ''
      }
    },
    mounted: function () {
      let _this = this
      this.$store.dispatch('listObjs').then(function (response) {
        _this.createEditor(response)
      }).catch(function () {
        _this.createEditor([])
      })
      window.onmousedown = this.ctrlMouseDown
      window.onmousemove = this.ctrlMouseMove
      window.onmouseup = this.ctrlMouseUp
      document.addEventListener('mouseleave', this.mouseLeaveWindow)
      this.loadComponent()
    },
    methods: {
      createEditor: function (hintOptions) {
        var _this = this
        this.editor = CodeMirror.fromTextArea(this.$refs.codeEditor, {
          mode: 'text/javascript',
          lineNumbers: true,
          lineWrapping: true,
          indentUnit: 4,  // 缩进
          foldGutter: true,
          styleActiveLine: true,
          cursorHeight: 0.85, // 光标高度
          extraKeys: {'Ctrl': 'autocomplete'}, // 输入s然后ctrl就可以弹出选择项
          theme: 'blackboard',
          hintOptions: {vobContext: hintOptions},
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
        })
        this.editor.on('keyPress', function () {
          _this.editor.showHint({}, {}, {vobContext: [{obj: '$api'}]})
        })
      },
      loadComponent: function () {
        let _this = this
        let loading = this.$loading({target: 'aside'})
        this.$store.dispatch('listComponent').then(function (data) {
          _this.components = data
          loading.close()
        }).catch(function () {
          loading.close()
        })
      },
      mouseLeaveWindow: function (e) {
        this.preY = 0
      },
      ctrlMouseDown: function (e) {
        let el = e.target || e.srcElement
        while (el) {
          if (el.className && el.className.indexOf('box-control') >= 0) {
            this.preY = e.clientY
          }
          el = el.parentNode
        }
      },
      ctrlMouseMove: function (e) {
        const nowY = e.clientY
        if (this.preY <= 0) {
          return
        }
        e.preventDefault()
        this.boxCodeHeight += nowY - this.preY
        if (this.boxCodeHeight < 50) {
          this.boxCodeHeight = 50
        } else if (this.boxCodeHeight > document.body.clientHeight - 100) {
          this.boxCodeHeight = document.body.clientHeight - 100
        } else {
          this.preY = nowY
        }
      },
      ctrlMouseUp: function (e) {
        this.preY = 0
      },
      run: function () {
        let console
        try {
          console = eval(this.editor.getValue())
        } catch (err) {
          console = err.name + ' at line number ' + err.lineNumber + ' cause by: ' + err.message
        }
        this.log(console)
      },
      log: function (text) {
        if (!text) {
          text = 'success'
        }
        this.dataConsole.unshift({
          type: 'log',
          time: parseInt(Date.now() / 1000),
          msg: text
        })
      },
      clearConsole: function () {
        this.dataConsole = []
      },
      submit: function (data) {
      },
      loadCode: function (id) {
      },
      saveAsComponent: function (newComponent) {
        let _this = this
        let content = _this.editor.getValue()
        _this.$store.dispatch('addComponent', {...newComponent, content: content}).then(function () {
          _this.componentVisible = false
          _this.loadComponent()
        })
      },
      addComponent: function (component) {
        // 如果不需要传入参数那么直接添加
        if (component.params == null || component.params.length === 0) {
          this.editor.replaceSelection(component.content + '\n')
          return
        }
        this.dialogVisible = true
        this.selectedComponent = component
      },
      sureAddScripts: function (component) {
        this.editor.replaceSelection(this.scriptResult)
        this.dialogVisible = false
      },
      onError: function () {
        this.$message.error('复制失败，请手动复制')
      },
      onCopy: function () {
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      }
    }
  }
</script>

<style>
  @import "../assets/CodeMirror/lib/codemirror.css";
  @import "../assets/CodeMirror/theme/blackboard.css";
  .container-home {
    height: 100%;
    background-color: #0C1021;
  }
  aside {
    position: fixed;
    width: 260px;
    left: 0;
    top: 0;
    height: 100%;
    box-sizing: border-box;
    background-color: #333;
    border-right: 1px solid #565656;
    z-index: 10;
    transition: transform .5s;
    will-change: transform;
  }
  .btn-toggle {
    position: absolute;
    width: 25px;
    height: 60px;
    right: -26px;
    background-color: #222;
    top: 50%;
    transform: translateY(-50%);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    border-top: 1px solid #565656;
    border-right: 1px solid #565656;
    border-bottom: 1px solid #565656;
    border-left: none;
    box-shadow: 1px 0 5px #111;
    background-position: center;
    background-size: 70%;
    background-repeat: no-repeat;
    outline: none;
    cursor: pointer;
  }
  .btn-toggle.close {
    background-image: url('../assets/image/arrow-close.png');
  }
  .btn-toggle.open {
    background-image: url('../assets/image/arrow-open.png');
  }
  .title {
    padding: 10px 0;
    background-color: #111;
    color: #999;
    text-align: center;
    font-size: 20px;
    font-weight: bolder;
    cursor: pointer;
    margin-top: 0px;
  }
  .list-project {
    list-style-type: none;
    padding: 0;
    margin: 0;
    overflow: auto;
    height: 800px;
  }

  .item-project {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .item-project {
    position: relative;
    padding: 0 8px;
    color: #999;
    word-wrap: break-word;
    word-break: break-all;
    cursor: pointer;
    font-size: 16px;
    height: 40px;
    line-height: 40px;
    display: flex;
    align-items: center;
  }
  .item-project:hover,
  .item-project.current {
    background-color: #222;
  }
  .btn-params{
    position: absolute;
    display: block;
    left: 0;
    top: 0;
    padding: 10px;
    height: 20px;
  }
  .btn-share {
    position: absolute;
    display: block;
    right: 0;
    top: 0;
    padding: 10px;
    height: 20px;
    visibility: hidden;
  }
  .btn-share:hover {
    height: 26px;
    padding: 7px;
    background-color: #2a2a2a;
  }
  .item-project:hover .btn-share,
  .item-project.current .btn-share {
    visibility: visible;
  }
  .btn-add {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    border: none;
    border-top: 1.5px solid #222;
    background-color: transparent;
    background-image: url('../assets/image/icon-refresh.png');
    background-repeat: no-repeat;
    background-size: 26px;
    background-position: center;
    cursor: pointer;
    outline: none;
  }
  .btn-add:hover {
    background-color: #222;
  }

  .box-editor {
    width: 100%;
    height: 100%;
    position: relative;
    padding-left: 260px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    transition: padding-left .5s;
    will-change:padding-left;
  }
  .box-code {
    font-size: 16px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .box-code>.CodeMirror {
    height: 100%;
  }
  .box-control {
    height: 50px;
    background-color: #333;
    border-top: 1px solid #565656;
    border-bottom: 1px solid #565656;
    cursor: move;
    flex-shrink: 0;
  }
  .box-control button {
    height: 30px;
    width: 80px;
    margin: 10px 0 10px 10px;
    box-sizing: border-box;
    border: 1px solid #565656;
    background-color: #222;
    color: #777;
    cursor: pointer;
    outline: none;
  }
  .box-control .box-right {
    float: right;
    margin-right: 30px;
  }
  .box-control button:active {
    background-color: #111;
    color: #565656;
  }
  .text-title {
    height: 32px;
    margin: 9px;
    box-sizing: border-box;
    outline: none;
    padding: 5px;
    font-size: 16px;
    font-family: 微软雅黑;
    width: 400px;
    color: #aaa;
    overflow: hidden;
  }
  .link-site {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    margin: 9px;
    font-family: 微软雅黑;
    color: #0c1021;
    font-size: 18px;
    font-weight: bolder;
    cursor: pointer;
    text-decoration: none;
    visibility: hidden;
  }
  .link-site:hover {
    text-decoration: underline;
  }

  .box-console {
    flex-grow: 1;
    background-color: #0C1021;
    overflow: auto;
  }
  .list-console, .item-console {
    margin: 0;
    padding: 0;
    list-style-type: none;
    font-size: 14px;
    color: #8DA6CE;
  }
  .list-console {
    padding: 10px 0;
  }
  .item-console {
    padding: 3px;
    word-wrap: break-word;
    word-break: break-all;
  }
  .item-console:hover {
    background-color: #222;
  }
  .item-console label {
    user-select:none;
  }

  .container-home.noAside aside {
    transform: translateX(-260px);
  }
  .container-home.noAside .box-editor {
    padding-left: 0;
  }
  .CodeMirror pre {
    font: 16px/1.5 Helvetica, Arial, sans-serif !important;
  }

  @media screen and (max-width : 1000px) {
    aside {
      display: none;
    }
    .box-editor {
      padding-left: 0;
    }
    .btn-save {
      display: none;
    }
    .link-site {
      visibility: visible;
    }
    .box-control .box-right {
      margin-right: 10px;
    }
  }
</style>
