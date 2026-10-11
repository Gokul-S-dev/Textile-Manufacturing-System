const argon2 = require('argon2');
async function verify() {
  const hash = '$argon2id$v=19$m=65536,p=4,t=3$50+QeSw/5kmnkrwd8A7DFA$nnL+9V9rZ1JbTNdA5bdhD+QoSkTTaIyeSNufDROjJp0';
  const match1 = await argon2.verify(hash, 'Admin@123!');
  const match2 = await argon2.verify(hash, 'password123');
  console.log('Admin@123! matches:', match1);
  console.log('password123 matches:', match2);
}
verify();
