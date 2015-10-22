/**
 * 工程配置
 * @name 应用名称
 * @ename 应用英文名称
 * @descriptyion  应用描述
 * @version  应用版本,每次release生成的版本名称也是依据此处，比如 0.0.1
 * @watch 	工程需要处理的目录，包括js|css|image|html
 * @watchExt 工程所需其他目录，路径相对于工程根目录，例如:tpl,php等，不作处理纯拷贝
 * @main  入口html页面
 * @port	工程测试服务端口
 *
 * @release  发布目录的相对路径，这里相对的是screw根目录
 * @assetsDomain 资源文件发布时的前置域名，比如要发布到cdn：http://cdn.xxx.com/img/,默认空表示保留当前路径
 */
module.exports = {
		name:'示例工程',
		ename:'screw-demo',
		description:'screw工程流模板工程',
		version:'1.0.0',
		watch:['clean','sprite',['css','js'],'image','html'],
		watchExt:[],
		// 路径参数
    main: {
      'html': 'html/index.html',
      'less': 'css/base.less'
    },
		port:8001,
		//发布参数
    release: "./release",
		assetsDomain:{
				'js':'',	// http://cdn.xxx.com/js/
				'css':'',	//http://cdn.xxx.com/css/
				'image':''	//http://cdn.xxx.com/i/
			},
	};
