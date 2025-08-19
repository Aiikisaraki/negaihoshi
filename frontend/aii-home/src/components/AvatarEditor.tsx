import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

type Area = { x: number; y: number; width: number; height: number };

interface AvatarEditorProps {
  file?: File | null;
  initialUrl?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

// 将裁剪区域导出为 Blob
async function getCroppedImage(imageSrc: string, crop: Area, rotation: number = 0, filter: string = 'none'): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const pixelRatio = window.devicePixelRatio || 1;
  const outputSize = Math.max(crop.width, crop.height);
  canvas.width = outputSize * pixelRatio;
  canvas.height = outputSize * pixelRatio;

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';
  ctx.filter = filter;

  // 平移到画布中心，应用旋转，再绘制裁剪区域
  ctx.translate(outputSize / 2, outputSize / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-outputSize / 2, -outputSize / 2);

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.92);
  });
}

export function AvatarEditor({ file, initialUrl, onCancel, onConfirm }: AvatarEditorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [filter, setFilter] = useState<'none' | 'grayscale(100%)' | 'sepia(60%)' | 'contrast(120%)' | 'saturate(130%)'>('none');

  // 预览 URL
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (initialUrl) setImageUrl(initialUrl);
  }, [file, initialUrl]);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    const blob = await getCroppedImage(imageUrl, croppedAreaPixels, rotation, filter);
    onConfirm(blob);
  }, [imageUrl, croppedAreaPixels, rotation, filter, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">编辑头像</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">关闭</button>
        </div>

        <div className="relative w-full h-[360px] bg-gray-900">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
              objectFit="contain"
              classes={{ containerClassName: 'rounded-b-2xl' }}
            />
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* 缩放与旋转 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">缩放</label>
              <input type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">旋转</label>
              <input type="range" min={-180} max={180} step={1} value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>

          {/* 滤镜 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">滤镜</label>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'none', label: '无' },
                { key: 'grayscale(100%)', label: '黑白' },
                { key: 'sepia(60%)', label: '复古' },
                { key: 'contrast(120%)', label: '对比增强' },
                { key: 'saturate(130%)', label: '饱和增强' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 rounded-full border ${filter === f.key ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">取消</button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}


