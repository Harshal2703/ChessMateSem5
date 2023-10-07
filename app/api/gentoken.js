var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'eij3dffkedfd93vd392dkwsd923mskw',{ algorithm: 'HS256' });
console.log(token)
jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNqc2pzakBza3Mua28iLCJwYXNzd29yZCI6ImFhYWFhYWFhYWFhYWFhIiwiaWF0IjoxNjk2NDg1MzIxfQ.7Ryy6H_TWajAguiQa8UrGcFY1T0alAJNMnjNA77x6hI', 'eij3dffkedfd93vd392dkwsd923mskw', function(err, decoded) {
    console.log(err)
    console.log(decoded) // bar
  });