var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var screwutil = require('./screw-util.js');

var through = require('through2');
var combiner = require('stream-combiner2');
var concat = require('concat-with-sourcemaps');

var pngquant = require('imagemin-pngquant');

// 加载gulp插件
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*'],
  rename: {
    'gulp-minify-css': 'minifyCSS'
  }
});

// 目录，配置
var config = require(process.cwd()+'/config.js');

//路径
var htmlPath = screwutil.html;
var assetPath = screwutil.assets;
var pathDsts = {
      'js':path.join(screwutil.tmpSpace,assetPath,'js'),
      'css':path.join(screwutil.tmpSpace,assetPath,'css'),
      'image':path.join(screwutil.tmpSpace,assetPath,'image'),
      'html':path.join(screwutil.tmpSpace,htmlPath)
    };
var pathSrcs = {
      'js':path.join(screwutil.workSpace,assetPath,'js','**','*.js'),
      'css':path.join(screwutil.workSpace,assetPath,'css','**', config.main.less || '*.less'),
      'image':path.join(screwutil.workSpace,assetPath,'image','**','*.+(png|jpg|gif|svg|PNG|JPG|GIF|SVG)'),
      'html':path.join(screwutil.workSpace,htmlPath,'**','*.html')
    };

var revPath =path.join(screwutil.revSpace,config.version);
var revAssets = path.join(revPath,assetPath);
var revlog =path.join(revPath,screwutil.logFile);

/***********************************gulp任务*/
// 常规任务
gulp.task('js', function() {
  var combined = combiner.obj([
      gulp.src(pathSrcs.js),
      $.watch(pathSrcs.js),
      $.jshint(),
      checkFile('js'),
      $.uglify({outSourceMap: false}),
      gulp.dest(pathDsts.js)
    ]);
  return combined;
});
gulp.task('css', function() {
  return gulp.src(pathSrcs.css)
    .pipe($.watch(pathSrcs.css))
    .pipe(checkFile('css'))
    .pipe($.less())
    .pipe($.minifyCSS({'removeEmpty':true,'compatibility': 'ie8,+units.rem,+selectors.ie7Hack'}))
    .pipe(gulp.dest(pathDsts.css))
    .on('error',function(err){
      console.log(err);
    });
});
gulp.task('image', function() {
  var combined = combiner.obj([
      gulp.src(pathSrcs.image),
      $.watch(pathSrcs.image),
      checkFile(),
      $.imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()]
      }),
      gulp.dest(pathDsts.image)
    ]);
  return combined;
});
gulp.task('html', function() {
  var combined = combiner.obj([
      gulp.src(pathSrcs.html),
      $.watch(pathSrcs.html),
      checkFile(),
      $.htmlmin({
        collapseWhitespace: false,
      }),
      gulp.dest(pathDsts.html)
    ]);
  return combined;
});
// 自定义扩展目录监控任务
var extTasks = [];
config.watchExt.forEach(function(d){
  extTasks.push({
    name: 'task_'+d,
    src:path.join(screwutil.workSpace,d,'**/*.*'),
    watch:path.join(screwutil.workSpace,d,'**'),
    dst:path.join(screwutil.tmpSpace,d)
  });
});
extTasks.forEach(function(t){
  gulp.task(t.name, function() {
    var combined = combiner.obj([
        gulp.src(t.src),
        $.watch(t.src),
        gulp.dest(t.dst)
      ]);
    return combined;
  });
});
// js，css,image
gulp.task('release',function() {
  // 以assets为相对路径
  var asswatch = path.join(screwutil.tmpSpace,assetPath,'**','*.+(css|js|png|jpg|gif|svg|PNG|JPG|GIF|SVG)'),
    combined = combiner.obj([
      gulp.src(asswatch),
      screwrev(path.join(revPath,htmlPath,'**','*.html'),10),
      gulp.dest(revAssets)
    ]);
  // 注销了错误报告  使用combiner是为了防止程序异常退出
  // combined.on('error', console.error.bind(console));
  // combined.on('error',function(err){
  //   console.error('css error! file:'+err.message+' line:'+err.lineNumber);
  // });
  return combined;
});

// 默认执行任务
extTasks.forEach(function(w){
  config.watch.push(w.name);
});
gulp.task('default', config.watch);
/******************************以下是自定义gulp任务*/
/**
 * 处理文件变化：1 如果是删除操作，删除对应的文件
 * @param ext 当前处理类型， js|css|image|html
 * @return {[type]}          [description]
 */
function checkFile(ftype){
  // 初次启动时 记录需要合并处理 合并文件夹，只有ftype为js或者css时才有可能不为空
  var firstMerges = [];
  return through.obj(function (file, env, cb) {
    // 文件可能被删除
    if (!file) {
      cb(null, file);
      return;
    }
    if (file.isStream()) {
      cb(new $.util.PluginError('screw', 'Streaming not supported'));
      return;
    }
    console.log('file:'+(file.event||'')+'->'+file.relative);
    //是否需要合并的文件夹内的文件变更，是的话加入变更文件夹数组，滞后统一处理。(只有js和css有此判断)
    var dirpath = path.dirname(file.path);
    if ((ftype == 'js'|| ftype == 'css') && fs.existsSync(path.join(dirpath,screwutil.oneFile))) {
      // 不是初次启动服务遍历文件 或者 是初次启动且不在记录数组中（未曾处理过）
      if ('event' in file){
        return cb(null,mergeFiles(dirpath,file,ftype));
      }else if(firstMerges.indexOf(dirpath)==-1){
        firstMerges.push(dirpath);
        return cb(null,mergeFiles(dirpath,file,ftype));
      }
    }
    // 不需要合并操作的单个文件删除操作处理
    if(file.event == 'unlink'){
      //费合并数组删除文件
      var result = fs.unlinkSync(path.join(screwutil.tmpSpace,assetPath,ftype,file.relative));
      if (result) {
        console.log('同步文件删除失败:'+file.relative);
      }else{
        console.log('同步删除文件成功:'+file.relative);
      }
    }
    cb(null,file);
  });
}
/**
 * 合并文件夹内的文件
 * @param folder 要合并的文件夹
 * @param file  引起操作的文件
 * @param ext    文件夹内文件的后缀， js|css
 * @return $.util.File;
 */
function mergeFiles(folder,file,ext){
  console.log('合并文件夹:'+folder);
  var buffers = [];
  var files = fs.readdirSync(folder);
  var relpath = path.basename();
  files.forEach(function(f){
    if (path.extname(f).slice(1)==ext) {
      buffers.push(fs.readFileSync(path.join(folder,f)));
    }
  });
  return new $.util.File({
    base: file.base,
    cwd: file.cwd,
    path: path.dirname(file.path)+'.'+ext,
    contents: Buffer.concat(buffers)
  });
}

/**
 * screw的资源版本处理工具，代码参考gulp-md5-plus和gulp-rename
 * @param  {string} htmlpath 要更新的html文件
 * @param  {int} size 取MD5的前几位 默认10
 */
function screwrev(htmlpath,size){
  size = size | 10;

  var assetsList = [];
  return through.obj(function (file, env, cb) {
    if (!file && typeof file !=='object') {
      return cb(new $.util.PluginError('screw','丢失文件参数或者文件参数不是对象'));
    }
    if (file.isStream()) {
      return cb(new $.util.PluginError('screw','暂不支持stream'));
    }
    if(!file.contents){
      return cb();
    }
    // 将资源文件生成md5文件
    var suffix = calcMd5(file.contents,size),
      oldrelfile = file.relative,
      fobj_old = parsePath(file.path),fobj_new,
      md5name = fobj_old.basename+'_'+suffix+fobj_old.extname,
      md5path = path.join(fobj_old.dirname,md5name);
    console.log('[screw] md5资源文件:'+oldrelfile+'->'+md5name);
    screwutil.log(revlog,file.relative+'->'+md5name);


    // 资源文件路径转换(1换成md5文件名，2如果有必要根据配置置换线上地址)
    file.path = md5path; //设置新路径之后，传给其他函数后将变成新路径的file
    var pathobj = getAssetsUrl(oldrelfile,file);
    // console.log(pathobj);
    assetsList.push(pathobj);

    this.push(file);
    cb();
  },function(cb){
    // 替换html中的所有资源文件为新路径
    if (assetsList.length>0) {
      var glob = require('glob');
      glob(htmlpath, function (err, files) {
        if(err) return console.log(err);
        files.forEach(function(fpath){
          console.log('处理文件中的发布资源文件：'+fpath);
          var content = fs.readFileSync(fpath,'utf8');
          assetsList.forEach(function(asset){
            // console.log('>>处理资源：'+asset.newpath);
            content = content.replace(asset.regexp,asset.newpath);
          });
          fs.writeFileSync(fpath, content, 'utf8');
        });
      });
    }
    cb();
  });
}

//md5
function calcMd5(str,size) {
  var crypto = require('crypto');
  var md5 = crypto.createHash('md5');
  md5.update(str, 'utf8');
  return size >0 ? md5.digest('hex').slice(0, size) : md5.digest('hex');
}
// 将路径转换为对象
function parsePath(fpath) {
  var extname = path.extname(fpath);
  return {
    dirname: path.dirname(fpath),
    basename: path.basename(fpath, extname),
    extname: extname
  };
}
// 根据config配置获取html中实际资源引用地址
function getAssetsUrl(oldrelfile,newfile){
  var newrelpath = newfile.relative,
    oldrelpath = path.join('../',oldrelfile),
    oldPath,newPath,newprefix,
    ext = path.extname(oldrelfile),
    index=ext.slice(1);

  if(index!='js' && index!='css'){
    index = 'image';
  }
  newprefix = config.assetsDomain[index];
  if (newprefix) {
    oldPath = path.join(path.join('../',assetPath,index),oldrelpath);
    newPath = path.join(newprefix,path.join('../',newrelpath));
  }else{
    oldPath = oldrelfile;
    newPath = newfile.relative;
  }
  return {
    newpath : newPath,
    regexp : new RegExp(oldPath,'g'),
    oldpath : oldPath,
  };
}
