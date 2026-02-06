// 测试 Bot 回调处理
// 运行: node test-bot-callback.js

// 模拟 ctx 对象
const mockCtx = {
  callbackQuery: {
    data: 'energy_rental'
  },
  match: ['energy_rental'],
  answerCbQuery: async (msg) => {
    console.log('answerCbQuery:', msg);
  }
};

// 测试 1: 使用 callbackQuery.data
console.log('测试 1: callbackQuery.data');
const action1 = mockCtx.callbackQuery?.data || mockCtx.match?.[0];
console.log('action:', action1);
console.log('匹配 energy_rental:', action1 === 'energy_rental');
console.log('包含 energy_rental:', action1?.includes('energy_rental'));
console.log('');

// 测试 2: 使用 match[0]
console.log('测试 2: match[0]');
const mockCtx2 = {
  match: ['energy_rental'],
  answerCbQuery: async (msg) => {
    console.log('answerCbQuery:', msg);
  }
};
const action2 = mockCtx2.callbackQuery?.data || mockCtx2.match?.[0];
console.log('action:', action2);
console.log('匹配 energy_rental:', action2 === 'energy_rental');
console.log('包含 energy_rental:', action2?.includes('energy_rental'));
console.log('');

// 测试 3: 正则匹配
console.log('测试 3: 正则匹配 /^energy_/');
const mockCtx3 = {
  callbackQuery: {
    data: 'energy_rental'
  },
  match: ['energy_rental'],
  answerCbQuery: async (msg) => {
    console.log('answerCbQuery:', msg);
  }
};
const action3 = mockCtx3.callbackQuery?.data || mockCtx3.match?.[0];
console.log('action:', action3);
console.log('正则匹配 /^energy_/:', /^energy_/.test(action3));
console.log('');

console.log('✅ 测试完成');
console.log('');
console.log('结论:');
console.log('1. 当使用 bot.action("energy_rental", ...) 时，应该使用 ctx.callbackQuery.data');
console.log('2. 当使用 bot.action(/^energy_/, ...) 时，可以使用 ctx.match[0]');
console.log('3. 为了兼容两种情况，使用: ctx.callbackQuery?.data || ctx.match?.[0]');
