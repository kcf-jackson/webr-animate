// import { isRDouble, isRCharacter, isRList } from '@r-wasm/webr';
import pkg from '@r-wasm/webr';
console.log(pkg);
console.log(pkg.isRList);


// const webR = new WebR();
// await webR.init();
// console.log(webR.RList);


// let result = await webR.evalR(`
//   sample( list(50.75, "foo", list(1,2,3)) , 1)[[1]]
// `);
// console.log(result);

// if (isRDouble(result)) {
//     let output = await result.toNumber();
//     console.log('A number: ', output)
// } else if (isRCharacter(result)) {
//     let output = await result.toString();
//     console.log('A string: ', output)
// } else if (isRList(result)) {
//     let output = (await result.toArray()).length;
//     console.log('A list with ', output, 'elements.')
// }
