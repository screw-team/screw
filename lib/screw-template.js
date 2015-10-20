/**
 * screw模板模块
 */
var fs = require('fs');
var path = require('path');
var screwutil = require('./screw-util.js');

// 模板的绝对路径
var tempRoot = path.resolve(path.dirname(fs.realpathSync(__filename)), "../template");

// 拷贝模板，要求再空目录下执行
exports.copy = function(tempName,workPath) {
	// 检查当模板是否存在
	tempName = tempName||'default';
	var tempPath = path.join(tempRoot,tempName);
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
	if (tempName=='default') {
		console.log('[screw] default模板不允许删除！');
		return;
	}
	var tempPath = path.join(tempRoot,tempName);
	var exits = fs.existsSync(tempPath);
	if (!exits) {
		console.log('[screw] 工程模板不存在！');
		return;
	}
	console.log('[screw] 模板删除中...');
	screwutil.delDir(tempPath);
	console.log('[screw] sucess');
};
// 保存模板
exports.save = function(tempName,workPath){
	// 检查模板名称是否存在
	var tempPath = path.join(tempRoot,tempName);
	var exits = fs.existsSync(tempPath);
	if (exits) {
		console.log('[screw] 错误,模板名称已经存在！');
		return;
	}
	console.log("[screw] 保存模板:%s", tempName);
	screwutil.copyDir(path.join(workPath,screwutil.tmpSpace),tempPath);
	console.log('[screw] success');
};

// 当前模板列表
exports.list = function(){
	fs.readdir(tempRoot, function(err, paths) {
		if (err) {
			throw err;
		}
		paths.forEach(function(p) {
			fs.stat(path.join(tempRoot,p),function(err,stat){
				if (!err && stat.isDirectory(p)) {
					console.log('> '+p);
				}
			});
		});
	});
};
