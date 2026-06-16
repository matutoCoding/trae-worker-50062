export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/orders/index',
    'pages/materials/index',
    'pages/profile/index',
    'pages/package-detail/index',
    'pages/order-create/index',
    'pages/order-detail/index',
    'pages/dispatch-detail/index',
    'pages/settlement-detail/index',
    'pages/review/index',
    'pages/payment-record/index',
    'pages/follow-up/index',
    'pages/finance-list/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2C3E50',
    navigationBarTitleText: '殡葬一条龙服务',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F7F8FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2C3E50',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/materials/index',
        text: '物资'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
