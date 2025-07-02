/**
 * 直接使用MongoDB驅動更新管理員角色
 */

import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://localhost:27017/';
const dbName = 'ailabor';

async function updateAdminRole() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to the MongoDB server');
    
    const db = client.db(dbName);
    const adminsCollection = db.collection('admins');
    
    // 查詢指定管理員
    const admin = await adminsCollection.findOne({ email: 'test@ailaborlaw.com' });
    
    if (!admin) {
      console.error('管理員未找到');
      return;
    }
    
    console.log('找到管理員:', admin.username, admin.email, admin.role);
    
    // 更新管理員角色
    const result = await adminsCollection.updateOne(
      { _id: admin._id },
      { $set: { role: 'super_admin' } }
    );
    
    if (result.modifiedCount === 1) {
      console.log('成功更新管理員角色為超級管理員');
      
      // 驗證更新
      const updatedAdmin = await adminsCollection.findOne({ _id: admin._id });
      console.log('更新後的管理員信息:', updatedAdmin.username, updatedAdmin.email, updatedAdmin.role);
    } else {
      console.log('未更新任何文檔');
    }
  } catch (err) {
    console.error('操作失敗:', err);
  } finally {
    await client.close();
    console.log('關閉MongoDB連接');
  }
}

// 執行更新
updateAdminRole(); 