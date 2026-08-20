import { minify } from '@swc/core';
const code = `
(() => {
function myVeryLongFunctionName(myVeryLongParameterName) {
  const myVeryLongLocalVariableName = myVeryLongParameterName + 1;
  return myVeryLongLocalVariableName;
}
const myVeryLongConstantName = 42;
console.log(myVeryLongFunctionName(myVeryLongConstantName));
})();
`;
minify(code, { compress: true, mangle: true }).then(res => console.log(res.code));
