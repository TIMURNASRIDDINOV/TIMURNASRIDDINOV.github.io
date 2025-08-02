import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

// Компонент 3D футболки
const TShirtModel = ({ color, uploadedTexture }) => {
  const meshRef = useRef();
  const { nodes, materials } = useGLTF('/models/tshirt.glb');
  
  // Медленное вращение
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  // Создаем материал для футболки с возможностью изменения цвета
  const tshirtMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Создаем материал для текстуры дизайна
  const designMaterial = uploadedTexture ? new THREE.MeshBasicMaterial({
    map: uploadedTexture,
    transparent: true,
    opacity: 0.9,
  }) : null;

  return (
    <group ref={meshRef} dispose={null}>
      {/* Основная модель футболки */}
      {nodes.TShirt && (
        <mesh
          geometry={nodes.TShirt.geometry}
          material={tshirtMaterial}
          scale={[1, 1, 1]}
        />
      )}
      
      {/* Если есть загруженная текстура, создаем плоскость для дизайна */}
      {uploadedTexture && (
        <mesh position={[0, 0.2, 0.51]} scale={[0.8, 0.8, 1]}>
          <planeGeometry args={[1, 1]} />
          <primitive object={designMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
};

// Простая 3D модель футболки (если GLB не загружается)
const SimpleTShirt = ({ color, uploadedTexture }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  const designMaterial = uploadedTexture ? new THREE.MeshBasicMaterial({
    map: uploadedTexture,
    transparent: true,
  }) : null;

  return (
    <group ref={meshRef}>
      {/* Основа футболки */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Рукава */}
      <mesh position={[-1.2, 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1.2, 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Воротник */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 16]} />
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.8)} />
      </mesh>

      {/* Дизайн на футболке */}
      {uploadedTexture && (
        <mesh position={[0, 0.2, 0.06]}>
          <planeGeometry args={[1, 1]} />
          <primitive object={designMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
};

// Основной компонент кастомизации
const Customization = () => {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedSize, setSelectedSize] = useState('M');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedTexture, setUploadedTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useSimpleModel, setUseSimpleModel] = useState(false);
  
  const fileInputRef = useRef();

  // Цвета футболок
  const colors = [
    { name: 'Белый', value: '#ffffff' },
    { name: 'Черный', value: '#000000' },
    { name: 'Красный', value: '#dc2626' },
    { name: 'Синий', value: '#2563eb' },
    { name: 'Зеленый', value: '#16a34a' },
  ];

  // Размеры
  const sizes = ['S', 'M', 'L', 'XL'];

  // Обработка загрузки изображения
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      // Создаем URL для предварительного просмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        const texture = new THREE.TextureLoader().load(e.target.result);
        texture.flipY = false;
        setUploadedTexture(texture);
      };
      reader.readAsDataURL(file);
    }
  };

  // Отправка дизайна на сервер
  const handleSendDesign = async () => {
    if (!uploadedImage) {
      alert('Пожалуйста, загрузите дизайн');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('design', uploadedImage);
    formData.append('size', selectedSize);
    formData.append('color', selectedColor);

    try {
      const response = await fetch('/api/send-design', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Дизайн успешно отправлен!');
      } else {
        alert('Ошибка при отправке дизайна');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при отправке дизайна');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ошибки загрузки GLB модели
  const handleModelError = () => {
    console.warn('GLB модель не найдена, используем простую 3D модель');
    setUseSimpleModel(true);
  };

  return (
    <div className="customization-container">
      <div className="customization-header">
        <h1>3D Кастомизация футболки</h1>
        <p>Создайте уникальный дизайн с помощью нашего 3D редактора</p>
      </div>

      <div className="customization-content">
        {/* 3D Вьювер */}
        <div className="model-viewer">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ height: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            
            <React.Suspense fallback={null}>
              {useSimpleModel ? (
                <SimpleTShirt 
                  color={selectedColor} 
                  uploadedTexture={uploadedTexture}
                />
              ) : (
                <ErrorBoundary fallback={<SimpleTShirt color={selectedColor} uploadedTexture={uploadedTexture} />}>
                  <TShirtModel 
                    color={selectedColor} 
                    uploadedTexture={uploadedTexture}
                    onError={handleModelError}
                  />
                </ErrorBoundary>
              )}
            </React.Suspense>
            
            <OrbitControls 
              enableZoom={true}
              enablePan={false}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
              maxDistance={8}
              minDistance={3}
            />
          </Canvas>
        </div>

        {/* Панель управления */}
        <div className="controls-panel">
          <div className="control-section">
            <h3>Цвет футболки</h3>
            <div className="color-selector">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${selectedColor === color.value ? 'active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3>Размер</h3>
            <select 
              value={selectedSize} 
              onChange={(e) => setSelectedSize(e.target.value)}
              className="size-selector"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="control-section">
            <h3>Загрузить дизайн</h3>
            <div className="upload-section">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button 
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? 'Изменить дизайн' : 'Выбрать файл'}
              </button>
              {uploadedImage && (
                <div className="uploaded-preview">
                  <p>Загружен: {uploadedImage.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="control-section">
            <button 
              className="send-design-btn"
              onClick={handleSendDesign}
              disabled={isLoading || !uploadedImage}
            >
              {isLoading ? 'Отправка...' : 'Отправить дизайн'}
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .customization-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .customization-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .customization-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .customization-header p {
          font-size: 1.2rem;
          color: #6b7280;
        }

        .customization-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .model-viewer {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .controls-panel {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 20px;
        }

        .control-section {
          margin-bottom: 30px;
        }

        .control-section h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 15px;
        }

        .color-selector {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .color-option {
          width: 50px;
          height: 50px;
          border: 3px solid #e5e7eb;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .size-selector {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          transition: border-color 0.2s;
        }

        .size-selector:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .upload-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .upload-btn {
          padding: 12px 24px;
          background: #f3f4f6;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .upload-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .uploaded-preview {
          padding: 10px;
          background: #f0f9ff;
          border-radius: 6px;
          font-size: 14px;
          color: #0369a1;
        }

        .send-design-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .send-design-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .send-design-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .customization-content {
            grid-template-columns: 1fr;
          }
          
          .controls-panel {
            position: static;
          }
        }
        `
      }} />
    </div>
  );
};

// Error Boundary для обработки ошибок загрузки моделей
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Model loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Предзагрузка GLB модели
useGLTF.preload('/models/tshirt.glb');

export default Customization;
