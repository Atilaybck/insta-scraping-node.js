// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Instagram Collection Schema
const instagramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  instagram: { type: String, required: true },
  sector: { type: String, required: true },
  isNewUser: { type: Boolean, default: false },
  isContracted: { type: Boolean, default: false },
  mailOpened: { type: Boolean, default: false },
  replied: { type: Boolean, default: false },
  priority: { type: Boolean, default: false },
  // Yeni not alanı (zorunlu değil)
  note: { type: String, required: false },
});

const Instagram = mongoose.model('Instagram', instagramSchema);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Bağlantısı
mongoose
  .connect('mongodb://localhost:27017/scraperDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('MongoDB bağlantısı başarısız:', err));

// API Endpoint: Yeni müşteri ekle
app.post('/api/instagram', async (req, res) => {
  const { name, email, phone, instagram, sector, note } = req.body;

  try {
    const existingCustomer = await Instagram.findOne({
      $or: [{ name }, { email }, { phone }, { instagram }],
    });

    if (existingCustomer) {
      return res.status(400).json({ error: 'Bu müşteri zaten kaydedilmiş.' });
    }

    const newEntry = new Instagram({
      name,
      email,
      phone,
      instagram,
      sector,
      note, // Not opsiyonel, boş bırakılabilir
    });
    await newEntry.save();
    res.status(201).json({ message: 'Bilgi başarıyla kaydedildi' });
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

// API Endpoint: Müşteri listesini al
app.get('/api/customers', async (req, res) => {
  try {
    const { isContracted } = req.query;
    let filter = {};
    if (isContracted !== undefined) {
      filter.isContracted = isContracted === 'true';
    }
    const customers = await Instagram.find(filter).limit(5);
    res.status(200).json(customers);
  } catch (error) {
    console.error('Müşteri verileri alınırken hata oluştu:', error);
    res.status(500).json({ error: 'Müşteri verileri alınamadı' });
  }
});

// API Endpoint: Toplam müşteri sayısını al
app.get('/api/customers/total', async (req, res) => {
  try {
    const total = await Instagram.countDocuments();
    res.status(200).json({ total });
  } catch (error) {
    console.error('Toplam müşteri sayısı alınırken hata oluştu:', error);
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});

// API Endpoint: İletişime geçen ve geçmeyen müşteri sayısını al
app.get('/api/customers/contracted', async (req, res) => {
  const { isContracted } = req.query;
  try {
    const count = await Instagram.countDocuments({ isContracted: isContracted === 'true' });
    res.status(200).json({ count });
  } catch (error) {
    console.error('İletişim durumu sayısı alınırken hata oluştu:', error);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});

// API Endpoint: Müşteri araması
app.get('/api/search-customers', async (req, res) => {
  const { query } = req.query;
  try {
    const customers = await Instagram.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { instagram: { $regex: query, $options: 'i' } },
      ],
    }).limit(5);

    res.status(200).json(customers);
  } catch (error) {
    console.error('Müşteri araması sırasında hata oluştu:', error);
    res.status(500).json({ error: 'Müşteri araması sırasında bir hata oluştu.' });
  }
});

// API Endpoint: Müşteri güncellemesi
app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    instagram,
    sector,
    note,
    isContracted,
    mailOpened,
    replied,
    priority,
  } = req.body;

  try {
    const updatedCustomer = await Instagram.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        instagram,
        sector,
        note,
        isContracted,
        mailOpened,
        replied,
        priority,
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı.' });
    }

    res.status(200).json({ message: 'Müşteri başarıyla güncellendi.' });
  } catch (error) {
    console.error('Müşteri güncellenirken hata oluştu:', error);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});

// Root Endpoint (Test için)
app.get('/', (req, res) => {
  res.send('Server Çalışıyor!');
});

// Sunucu Başlatma
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
