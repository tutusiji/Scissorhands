# 灵活的图片拼接合并工具——剪刀手

## 自动化部署——git更新方案中package.json的diff比较

背景：本地开发完成代码后，需要将代码提交到git仓库，然后服务端通过git pull拉取最新代码，然后进行代码更新，再执行后续的部署和服务重启操作。

问题：如果本地本地装了新的插件功能，代码中体现，但是服务端没有安装，如何通知服务端也进行更新操作？

方案：

1. 读取git 更新的信息，看 ``package.json`` 文件是否有更新
2. 比较两个 ``package.json`` 文件以查看它们是否有差异
3. 如果有更新，查找其中新增/修改的依赖项，并通知服务端安装

通过nodejs执行脚本检查package.json 是否有更新：
```js
const { exec } = require('child_process');

exec('git status package.json', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    if (stdout.includes('modified')) {
        console.log('package.json has been modified.');
    } else {
        console.log('No changes in package.json.');
    }
});
```
比较并输出二者的不同之处，并执行 npm install 操作：
```js
// compare package.json
const json1 = { name: "package1", version: "1.0.0", dependencies: { lodash: "^4.17.21" } };
const json2 = { name: "package2", version: "1.0.1", dependencies: { lodash: "^4.17.20" } };

function findDifferences(obj1, obj2, parent) {
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    let differences = [];

    keys.forEach(key => {
        const path = parent ? `${parent}.${key}` : key;
        if (!(key in obj1)) {
            differences.push(`${path} is missing in the first JSON object.`);
        } else if (!(key in obj2)) {
            differences.push(`${path} is missing in the second JSON object.`);
        } else if (isObject(obj1[key]) && isObject(obj2[key])) {
            differences = differences.concat(findDifferences(obj1[key], obj2[key], path));
        } else if (obj1[key] !== obj2[key]) {
            differences.push(`Value of "${path}" differs: ${obj1[key]} vs ${obj2[key]}`);
        }
    });

    return differences;
}

function isObject(object) {
    return object != null && typeof object === 'object';
}

function displayDifferences(differences) {
    const container = document.getElementById('differences');
    if (differences.length === 0) {
        container.innerHTML = "<p>No differences found.</p>";
    } else {
        const list = document.createElement('ul');
        differences.forEach(difference => {
            const item = document.createElement('li');
            item.textContent = difference;
            list.appendChild(item);
        });
        container.appendChild(list);
    }
}

const differences = findDifferences(json1, json2);
displayDifferences(differences);
```

拿到其中修改过的项再依次执行npm install 操作






