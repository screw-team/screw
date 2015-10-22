#Screw

##install  
```
npm install screw-cli -g
```

##useage

###init  
```
screw init [template name]
```

###server  
```
screw dev --start
screw dev --stop
screw dev --restart
screw dev --info
screw dev --help
```

###release  
```
screw release
```

##TODO

- [x] cli 主体
- [x] release 命令
- [x] init模板功能
- [x] LESS 预处理
- [x] CSS sprite 生成
- [x] static 目录文件清理
- [x] 模板分离到独立的库
- [ ] js 替换为 webpack 打包处理
- [ ] gulp release 调整
- [ ] 模块组件结构
- [ ] 模块组件引用
- [ ] 模块组件 install
- [ ] CLI output colorful #[cli-color](https://github.com/medikoo/cli-color)

##Bug

- [x] html 里的js文件路径未替换
- [x] CTRL + C  停止服务的报错
- [ ] js 文件合并逻辑bug

##known issues

- [ ] 目前 gulpfile 和 node_modules 是直接软链接的，需要改变一种方式
- [ ] init模板目前从github获取，目录不能配置
- [ ] init安装模板后，未清理临时目录（~/.screw-download）下的文件
