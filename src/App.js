import './App.css';
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

function App() {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  // Firebase'den siparişleri çek
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    });
    return () => unsub();
  }, []);

  // Belirli masaya ait siparişleri getir ve ürünleri birleştir
  const getMergedOrdersForTable = (tableNumber) => {
    const tableOrders = orders.filter(order => order.tableNumber === tableNumber);
    const merged = {};

    tableOrders.forEach(order => {
      order.items.forEach(item => {
        if (!merged[item.productId]) {
          merged[item.productId] = { ...item };
        } else {
          merged[item.productId].quantity += item.quantity;
        }
      });
    });

    const mergedItems = Object.values(merged);
    const total = mergedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { mergedItems, total, orderIds: tableOrders.map(o => o.id), tableOrders };
  };

  // Tüm siparişleri sil
  const handleDeleteAllOrders = async (orderIds) => {
    if (window.confirm("Tüm siparişler silinsin mi?")) {
      for (let id of orderIds) {
        await deleteDoc(doc(db, 'orders', id));
      }
      alert("Tüm siparişler silindi.");
    }
  };

  return (
    <div className='container'>
      {/* Sol taraf: Masalar */}
      <div className='sidebar'>
        <h2>Masalar</h2>
        <div className='tables-grid'>
          {[...Array(24)].map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedTable(i + 1)}
              style={{ backgroundColor: selectedTable === i + 1 ? '#4caf50' : '' }}
            >
              Masa {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Sağ taraf: Siparişler */}
      <div id="orderDetails">
        <h2>{selectedTable ? `Masa ${selectedTable} Siparişleri` : 'Bir masa seçiniz'}</h2>

        {selectedTable && (() => {
          const { mergedItems, total, orderIds, tableOrders } = getMergedOrdersForTable(selectedTable);

          if (mergedItems.length === 0) {
            return <p>Henüz sipariş yok.</p>;
          }

          // Garson adlarını benzersiz olarak almak için:
          const waiterNames = [...new Set(tableOrders.map(o => o.waiterName))];

          return (
            <div className='order-card'>
              {/* Garson Adları */}
              <p><strong>Garsonlar:</strong> {waiterNames.join(', ')}</p>

              {/* Sipariş Detayları */}
              <ul className='order-items'>
                {mergedItems.map((item, i) => (
                  <li key={i}>
                    {item.name} x {item.quantity} = {(item.price * item.quantity).toFixed(2)} ₺
                  </li>
                ))}
              </ul>

              {/* Toplam */}
              <strong className='total'>Toplam: {total.toFixed(2)} ₺</strong>

              {/* Hesap Ödendi Butonu */}
              <button className="pay-button" onClick={() => handleDeleteAllOrders(orderIds)}>
                Hesap Ödendi
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default App;
