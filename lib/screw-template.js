/**
 * screw模板模块
 */
var fs = require('fs');
var path = require('path');
var screwutil = require('./screw-util.js');

// 拷贝模板，要求再空目录下执行
exports.copy = function(tempName, tempPath, workPath) {
	// 检查当模板是否存在
	var exits = fs.existsSync(tempPath);
	if (!exits) {
		console.log('[screw] 工程模板不存在！');
		return;
	}
	// 拷贝模板初始化工程
	console.log("[screw] 拷贝模板:%s", tempName);
	screwutil.copyDir(tempPath, workPath);
	console.log('[screw] success');
};
//删除模板
exports.del = function(tempName){
	//@TODO 模板删除
};
// 保存模板
exports.save = function(tempName,workPath){
	//@TODO 模板保存
};

// 当前模板列表
exports.list = function(){
	//@TODO 模板列表
};
