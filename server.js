// server.js - Серверная часть для обработки заказов

const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Для статических файлов
app.use("/data", express.static(path.join(__dirname, "data"))); // Для JSON файлов

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/designs/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "design-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Неподдерживаемый формат файла"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 МБ
  },
});

// Настройка nodemailer
const transporter = nodemailer.createTransport({
  // Для Gmail
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },

  // Для других SMTP серверов
  /*
    host: 'smtp.your-email-provider.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    */
});

// Проверка подключения к email
transporter.verify((error, success) => {
  if (error) {
    console.log("Ошибка настройки email:", error);
    console.log("🚀 Сервер запустится в режиме без email уведомлений");
  } else {
    console.log("Email сервер готов к отправке сообщений");
  }
});

// База данных заказов (в реальном проекте используйте MongoDB, PostgreSQL и т.д.)
let orders = [];
let orderCounter = 1000;

// Цены товаров
const productPrices = {
  tshirt: 1299,
  underwear: 699,
  hoodie: 2599,
  tank: 999,
};

// Названия товаров и цветов для email
const productNames = {
  tshirt: "Футболка",
  underwear: "Нижнее белье",
  hoodie: "Худи",
  tank: "Майка",
};

const colorNames = {
  white: "Белый",
  black: "Черный",
  navy: "Темно-синий",
  gray: "Серый",
  red: "Красный",
  green: "Зеленый",
};

// Маршруты

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

// Каталог товаров
app.get("/catalog", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Админ-панель
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Простая админ-панель
app.get("/simple-admin", (req, res) => {
  res.sendFile(path.join(__dirname, "simple-admin.html"));
});

// Страница создания тестовых заказов
app.get("/test-orders", (req, res) => {
  res.sendFile(path.join(__dirname, "test-orders.html"));
});

// Демо схемы продукта
app.get("/product-schema-demo", (req, res) => {
  res.sendFile(path.join(__dirname, "product-schema-demo.html"));
});

// Создание нового заказа с расширенной валидацией
app.post(
  "/api/orders",
  upload.fields([
    { name: "designFile", maxCount: 1 },
    { name: "mockupImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        productType,
        color,
        size,
        fullName,
        email,
        phone,
        city,
        address,
        notes,
      } = req.body;

      // Получаем файлы из req.files
      const designFile = req.files?.designFile?.[0];
      const mockupImage = req.files?.mockupImage?.[0];

      // Подробная валидация входных данных
      const validationResult = validateOrderData({
        productType,
        color,
        size,
        fullName,
        email,
        phone,
        city,
        address,
        designFile: designFile,
      });

      if (!validationResult.isValid) {
        return res.status(400).json({
          error: "Ошибка валидации",
          details: validationResult.errors,
          field: validationResult.field,
        });
      }

      // Проверка файла дизайна
      if (!designFile) {
        return res.status(400).json({
          error: "Загрузите файл дизайна",
          field: "designFile",
        });
      }

      // Дополнительная валидация файла
      const fileValidation = validateDesignFile(designFile);
      if (!fileValidation.isValid) {
        return res.status(400).json({
          error: fileValidation.error,
          field: "designFile",
        });
      }

      // Создание заказа с уникальным ID
      const orderId = generateOrderId();
      const totalPrice = calculateOrderPrice(productType);

      const order = {
        id: orderId,
        orderNumber: `ORD-${Date.now()}-${orderId}`,
        product: {
          type: productType,
          name: productNames[productType],
          color: color,
          colorName: colorNames[color],
          size: size.toUpperCase(),
          price: productPrices[productType],
        },
        customer: {
          fullName: sanitizeInput(fullName),
          email: email.toLowerCase().trim(),
          phone: formatPhoneNumber(phone),
          city: sanitizeInput(city),
          address: sanitizeInput(address),
          notes: sanitizeInput(notes) || "",
        },
        design: {
          filename: designFile.filename,
          originalName: designFile.originalname,
          size: designFile.size,
          path: designFile.path,
          mimetype: designFile.mimetype,
        },
        pricing: {
          productPrice: productPrices[productType],
          printingCost: 500,
          shippingCost: 300,
          totalPrice: totalPrice,
        },
        status: "pending_review",
        statusHistory: [
          {
            status: "pending_review",
            timestamp: new Date().toISOString(),
            note: "Заказ создан и ожидает проверки",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Сохранение заказа в "базе данных" (массив)
      // В реальном проекте здесь была бы настоящая БД
      const savedOrder = await saveOrderToDatabase(order);

      // Отправка уведомлений по email
      await sendOrderNotifications(savedOrder);

      // Логирование для аудита
      console.log(`Новый заказ создан: ${savedOrder.orderNumber}`, {
        orderId: savedOrder.id,
        customer: savedOrder.customer.email,
        product: savedOrder.product.name,
        totalPrice: savedOrder.pricing.totalPrice,
      });

      res.status(201).json({
        success: true,
        message: "Заказ успешно создан",
        data: {
          orderId: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
          totalPrice: savedOrder.pricing.totalPrice,
          estimatedDelivery: calculateEstimatedDelivery(
            savedOrder.customer.city
          ),
          status: savedOrder.status,
        },
      });
    } catch (error) {
      console.error("Ошибка создания заказа:", error);

      // Удаление загруженного файла в случае ошибки
      if (designFile && designFile.path) {
        try {
          fs.unlinkSync(designFile.path);
        } catch (deleteError) {
          console.error("Ошибка удаления файла:", deleteError);
        }
      }

      res.status(500).json({
        error: "Внутренняя ошибка сервера",
        message: "Попробуйте повторить заказ позже или обратитесь в поддержку",
      });
    }
  }
);

// Вспомогательные функции для валидации и обработки

// Функция валидации данных заказа
function validateOrderData(data) {
  const errors = [];

  // Валидация типа товара
  if (
    !data.productType ||
    !Object.keys(productPrices).includes(data.productType)
  ) {
    errors.push("Некорректный тип товара");
    return { isValid: false, errors, field: "productType" };
  }

  // Валидация цвета
  const validColors = ["white", "black", "navy", "gray", "red", "green"];
  if (!data.color || !validColors.includes(data.color)) {
    errors.push("Некорректный цвет товара");
    return { isValid: false, errors, field: "color" };
  }

  // Валидация размера
  const validSizes = ["xs", "s", "m", "l", "xl", "xxl"];
  if (!data.size || !validSizes.includes(data.size.toLowerCase())) {
    errors.push("Некорректный размер товара");
    return { isValid: false, errors, field: "size" };
  }

  // Валидация имени
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push("Имя должно содержать минимум 2 символа");
    return { isValid: false, errors, field: "fullName" };
  }

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Некорректный email адрес");
    return { isValid: false, errors, field: "email" };
  }

  // Валидация телефона
  const phoneRegex = /^\+?[7-8][\d\s\-\(\)]{10,}$/;
  if (!data.phone || !phoneRegex.test(data.phone.replace(/\s/g, ""))) {
    errors.push("Некорректный номер телефона");
    return { isValid: false, errors, field: "phone" };
  }

  // Валидация города
  if (!data.city || data.city.trim().length < 2) {
    errors.push("Название города должно содержать минимум 2 символа");
    return { isValid: false, errors, field: "city" };
  }

  // Валидация адреса
  if (!data.address || data.address.trim().length < 10) {
    errors.push("Адрес должен содержать минимум 10 символов");
    return { isValid: false, errors, field: "address" };
  }

  return { isValid: true, errors: [] };
}

// Функция валидации файла дизайна
function validateDesignFile(file) {
  if (!file) {
    return { isValid: false, error: "Файл не загружен" };
  }

  // Проверка размера файла (10 МБ)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "Размер файла не должен превышать 10 МБ" };
  }

  // Проверка типа файла
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "image/svg+xml",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: "Поддерживаемые форматы: JPG, PNG, PDF, SVG",
    };
  }

  // Проверка расширения файла
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".svg"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: "Недопустимое расширение файла" };
  }

  return { isValid: true };
}

// Функция генерации ID заказа
function generateOrderId() {
  return orderCounter++;
}

// Функция расчета стоимости заказа
function calculateOrderPrice(productType) {
  const productPrice = productPrices[productType] || 0;
  const printingCost = 500;
  const shippingCost = 300;
  return productPrice + printingCost + shippingCost;
}

// Функция очистки пользовательского ввода
function sanitizeInput(input) {
  if (!input) return "";
  return input.toString().trim().replace(/[<>]/g, "");
}

// Функция форматирования номера телефона
function formatPhoneNumber(phone) {
  if (!phone) return "";

  // Удаляем все символы кроме цифр
  const digits = phone.replace(/\D/g, "");

  // Приводим к российскому формату
  if (digits.startsWith("8")) {
    return "+7" + digits.slice(1);
  } else if (digits.startsWith("7")) {
    return "+" + digits;
  } else if (digits.length === 10) {
    return "+7" + digits;
  }

  return phone;
}

// Функция расчета предполагаемой даты доставки
function calculateEstimatedDelivery(city) {
  const deliveryDays = {
    москва: 1,
    "санкт-петербург": 2,
    екатеринбург: 3,
    новосибирск: 4,
    казань: 3,
    "нижний новгород": 2,
    челябинск: 3,
    самара: 3,
    омск: 4,
    "ростов-на-дону": 3,
    уфа: 3,
    красноярск: 5,
    воронеж: 2,
    пермь: 3,
    волгоград: 3,
  };

  const cityLower = city.toLowerCase().trim();
  const days = deliveryDays[cityLower] || 5; // По умолчанию 5 дней

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days + 3); // +3 дня на изготовление

  return deliveryDate.toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Функция сохранения заказа в "базу данных"
async function saveOrderToDatabase(order) {
  try {
    // В реальном проекте здесь был бы запрос к БД
    // Например: await Order.create(order);

    // Имитация задержки БД
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Добавляем в массив (имитация БД)
    orders.push(order);

    // Сохраняем в файл для персистентности (опционально)
    try {
      const ordersData = JSON.stringify(orders, null, 2);
      await fs.promises.writeFile("orders.json", ordersData, "utf8");
    } catch (fileError) {
      console.warn("Не удалось сохранить заказы в файл:", fileError.message);
    }

    return order;
  } catch (error) {
    console.error("Ошибка сохранения заказа:", error);
    throw new Error("Не удалось сохранить заказ в базу данных");
  }
}

// Получение списка заказов
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Получение конкретного заказа
app.get("/api/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return res.status(404).json({
      error: "Заказ не найден",
    });
  }

  res.json(order);
});

// Обновление статуса заказа
app.patch("/api/orders/:id/status", (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({
      error: "Заказ не найден",
    });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: "Статус заказа обновлен",
  });
});

// Улучшенная функция отправки уведомлений
async function sendOrderNotifications(order) {
  try {
    // Проверяем настройку email транспортера
    if (!transporter) {
      console.warn("Email транспортер не настроен, уведомления не отправлены");
      return;
    }

    const emailPromises = [];

    // Email для администратора
    const adminEmailOptions = {
      from: process.env.EMAIL_USER || "noreply@yourstore.com",
      to: process.env.ADMIN_EMAIL || "admin@yourstore.com",
      subject: `🆕 Новый заказ ${order.orderNumber}`,
      html: generateAdminEmailHTML(order),
      attachments: [
        {
          filename: order.design.originalName,
          path: order.design.path,
          cid: "design-file",
        },
      ],
    };

    // Email для клиента
    const customerEmailOptions = {
      from: process.env.EMAIL_USER || "noreply@yourstore.com",
      to: order.customer.email,
      subject: `✅ Подтверждение заказа ${order.orderNumber}`,
      html: generateCustomerEmailHTML(order),
      replyTo:
        process.env.SUPPORT_EMAIL ||
        process.env.ADMIN_EMAIL ||
        "support@yourstore.com",
    };

    // Проверяем, настроен ли email
    const emailConfigured =
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      !process.env.EMAIL_USER.includes("your-email") &&
      !process.env.EMAIL_PASS.includes("your-app-password");

    if (!emailConfigured) {
      console.log("⚠️ Email не настроен, отправка пропущена");
    } else {
      // Отправляем email параллельно для ускорения
      emailPromises.push(
        transporter.sendMail(adminEmailOptions).catch((error) => {
          console.error("Ошибка отправки email администратору:", error);
          return { error: "admin_email_failed" };
        })
      );

      emailPromises.push(
        transporter.sendMail(customerEmailOptions).catch((error) => {
          console.error("Ошибка отправки email клиенту:", error);
          return { error: "customer_email_failed" };
        })
      );
    }

    const results = await Promise.all(emailPromises);

    // Проверяем результаты отправки
    const adminResult = results[0];
    const customerResult = results[1];

    let successCount = 0;
    if (!adminResult.error) {
      console.log(
        `✅ Email администратору отправлен для заказа ${order.orderNumber}`
      );
      successCount++;
    }

    if (!customerResult.error) {
      console.log(`✅ Email клиенту отправлен для заказа ${order.orderNumber}`);
      successCount++;
    }

    // Обновляем статус заказа с информацией об email
    const emailStatus = {
      adminEmailSent: !adminResult.error,
      customerEmailSent: !customerResult.error,
      emailSentAt: new Date().toISOString(),
    };

    // Добавляем информацию об email в заказ
    order.emailNotifications = emailStatus;

    if (successCount === 0) {
      throw new Error("Не удалось отправить ни одного email уведомления");
    }

    console.log(
      `📧 Отправлено ${successCount}/2 email уведомлений для заказа ${order.orderNumber}`
    );
  } catch (error) {
    console.error("Критическая ошибка отправки email:", error);
    // Не останавливаем выполнение, просто логируем ошибку
    // В реальном проекте можно добавить в очередь повторной отправки
  }
}

// Улучшенная генерация HTML для email администратора
function generateAdminEmailHTML(order) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6f 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .header .order-number { font-size: 14px; opacity: 0.9; margin-top: 5px; }
            .content { padding: 30px 20px; background: #f8f9fa; }
            .order-details { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2c5aa0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #555; }
            .detail-value { color: #333; }
            .total { font-size: 20px; font-weight: bold; color: #2c5aa0; background: #f0f4ff; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #fff3cd; color: #856404; }
            .footer { background: #fff; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .urgent { background: #fff5f5; border-left-color: #ef4444; }
            .section-title { color: #2c5aa0; font-size: 18px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #e0e7ff; padding-bottom: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🆕 Новый заказ</h1>
                <div class="order-number">${order.orderNumber}</div>
            </div>
            <div class="content">
                <div class="order-details urgent">
                    <h3 class="section-title">📦 Информация о товаре</h3>
                    <div class="detail-row">
                        <span class="detail-label">Тип товара:</span>
                        <span class="detail-value">${order.product.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Цвет:</span>
                        <span class="detail-value">${
                          order.product.colorName
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Размер:</span>
                        <span class="detail-value">${order.product.size}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Базовая цена:</span>
                        <span class="detail-value">${
                          order.product.price
                        } ₽</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Статус:</span>
                        <span class="detail-value"><span class="status-badge">${
                          order.status
                        }</span></span>
                    </div>
                </div>
                
                <div class="order-details">
                    <h3 class="section-title">👤 Информация о клиенте</h3>
                    <div class="detail-row">
                        <span class="detail-label">Имя:</span>
                        <span class="detail-value">${
                          order.customer.fullName
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value"><a href="mailto:${
                          order.customer.email
                        }">${order.customer.email}</a></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Телефон:</span>
                        <span class="detail-value"><a href="tel:${
                          order.customer.phone
                        }">${order.customer.phone}</a></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Город:</span>
                        <span class="detail-value">${order.customer.city}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Адрес:</span>
                        <span class="detail-value">${
                          order.customer.address
                        }</span>
                    </div>
                    ${
                      order.customer.notes
                        ? `
                    <div class="detail-row">
                        <span class="detail-label">Комментарии:</span>
                        <span class="detail-value">${order.customer.notes}</span>
                    </div>
                    `
                        : ""
                    }
                </div>
                
                <div class="order-details">
                    <h3 class="section-title">💰 Стоимость заказа</h3>
                    <div class="detail-row">
                        <span class="detail-label">Товар:</span>
                        <span class="detail-value">${
                          order.pricing.productPrice
                        } ₽</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Печать дизайна:</span>
                        <span class="detail-value">${
                          order.pricing.printingCost
                        } ₽</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Доставка:</span>
                        <span class="detail-value">${
                          order.pricing.shippingCost
                        } ₽</span>
                    </div>
                </div>
                
                <div class="total">
                    ИТОГО: ${order.pricing.totalPrice} ₽
                </div>
                
                <div class="order-details">
                    <h3 class="section-title">🎨 Файл дизайна</h3>
                    <div class="detail-row">
                        <span class="detail-label">Имя файла:</span>
                        <span class="detail-value">${
                          order.design.originalName
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Размер:</span>
                        <span class="detail-value">${(
                          order.design.size /
                          1024 /
                          1024
                        ).toFixed(2)} МБ</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Тип файла:</span>
                        <span class="detail-value">${
                          order.design.mimetype
                        }</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Загружен:</span>
                        <span class="detail-value">${new Date(
                          order.design.uploadedAt
                        ).toLocaleString("ru-RU")}</span>
                    </div>
                    <p><strong>📎 Файл дизайна прикреплен к этому письму</strong></p>
                </div>
                
                <div class="order-details">
                    <h3 class="section-title">📅 Информация о заказе</h3>
                    <div class="detail-row">
                        <span class="detail-label">ID заказа:</span>
                        <span class="detail-value">${order.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Номер заказа:</span>
                        <span class="detail-value">${order.orderNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Дата создания:</span>
                        <span class="detail-value">${new Date(
                          order.createdAt
                        ).toLocaleString("ru-RU")}</span>
                    </div>
                </div>
            </div>
            <div class="footer">
                <p><strong>⚡ Требуется обработка!</strong></p>
                <p>Этот заказ ожидает проверки дизайна и подтверждения.</p>
                <p>Система управления заказами: <a href="http://localhost:3000/admin">Перейти к заказу</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Улучшенная генерация HTML для email клиента
function generateCustomerEmailHTML(order) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6f 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f8f9fa; }
            .order-summary { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2c5aa0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .total { font-size: 20px; font-weight: bold; color: #2c5aa0; background: #f0f4ff; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
            .footer { background: #fff; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .steps { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; }
            .steps ul { padding-left: 20px; }
            .steps li { margin: 8px 0; }
            .section-title { color: #2c5aa0; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Спасибо за ваш заказ!</h1>
                <p>Заказ ${order.orderNumber} принят в обработку</p>
            </div>
            <div class="content">
                <p>Здравствуйте, <strong>${
                  order.customer.fullName
                }</strong>!</p>
                <p>Мы получили ваш заказ на кастомный товар и приступили к его обработке.</p>
                
                <div class="order-summary">
                    <h3 class="section-title">📦 Детали заказа</h3>
                    <div class="detail-row">
                        <span><strong>Товар:</strong></span>
                        <span>${order.product.name}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Цвет:</strong></span>
                        <span>${order.product.colorName}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Размер:</strong></span>
                        <span>${order.product.size}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Адрес доставки:</strong></span>
                        <span>${order.customer.city}, ${
    order.customer.address
  }</span>
                    </div>
                </div>
                
                <div class="total">
                    Общая стоимость: ${order.pricing.totalPrice} ₽
                </div>
                
                <div class="steps">
                    <h3 class="section-title">📋 Что дальше</h3>
                    <ul>
                        <li>✨ Мы проверим ваш дизайн в течение 24 часов</li>
                        <li>📞 При необходимости свяжемся с вами для уточнений</li>
                        <li>🎨 Изготовление займет 3-5 рабочих дней</li>
                        <li>🚚 Доставка 1-3 дня в зависимости от региона</li>
                        <li>📬 Предполагаемая дата доставки: <strong>${calculateEstimatedDelivery(
                          order.customer.city
                        )}</strong></li>
                    </ul>
                </div>
                
                <div class="order-summary">
                    <h3 class="section-title">📞 Контакты</h3>
                    <p>Мы отправим вам уведомление о каждом этапе выполнения заказа на email <strong>${
                      order.customer.email
                    }</strong></p>
                    <p>По всем вопросам обращайтесь:</p>
                    <ul>
                        <li>📧 Email: support@yourstore.com</li>
                        <li>📱 Телефон: +7 (800) 123-45-67</li>
                        <li>💬 Telegram: @yourstore_support</li>
                    </ul>
                </div>
                
                <div class="order-summary">
                    <h3 class="section-title">📋 Информация о заказе</h3>
                    <div class="detail-row">
                        <span><strong>Номер заказа:</strong></span>
                        <span>${order.orderNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Дата создания:</strong></span>
                        <span>${new Date(order.createdAt).toLocaleString(
                          "ru-RU"
                        )}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Статус:</strong></span>
                        <span>Ожидает проверки</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Спасибо, что выбрали нас! 🎉</strong></p>
                <p>С уважением,<br/>Команда вашего магазина</p>
                <p>🌐 Сайт: yourstore.com | 📱 Телефон: +7 (800) 123-45-67</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Обработка ошибок
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Размер файла не должен превышать 10 МБ",
      });
    }
    return res.status(400).json({
      error: "Ошибка загрузки файла",
    });
  }

  console.error(error);
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Форма доступна по адресу: http://localhost:${PORT}`);
});

module.exports = app;
