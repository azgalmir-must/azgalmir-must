
import React from 'react';
import { AspectRatio, ImageSize, EnvironmentHDRI } from './types';

export const STYLES_CONFIG = [
  { id: 'photorealistic', name: 'واقعي جداً (V-Ray)', description: 'أعلى مستوى من التفاصيل والانعكاسات', icon: '📸' },
  { id: 'realistic', name: 'رندر معماري (Enscape)', description: 'توازن بين السرعة والواقعية', icon: '🏗️' },
  { id: 'night_view', name: 'لقطة ليلية', description: 'أضواء دافئة وانعكاسات ليلية', icon: '🌙' },
  { id: 'watercolor', name: 'رسم مائي فني', description: 'أسلوب يدوي احترافي', icon: '🎨' },
];

export const LIGHTING_CONFIG = [
  { id: 'natural', name: 'ضوء طبيعي', icon: '☀️' },
  { id: 'studio', name: 'إضاءة استوديو', icon: '💡' },
  { id: 'dramatic', name: 'إضاءة درامية', icon: '⚡' },
  { id: 'warm', name: 'غروب دافئ', icon: '🌅' },
];

export const ENVIRONMENT_CONFIG: { id: EnvironmentHDRI; name: string; desc: string; icon: string }[] = [
  { id: 'interior', name: 'رندر داخلي', desc: 'إضاءة اصطناعية وتفاصيل داخلية ناعمة', icon: '🏠' },
  { id: 'downtown', name: 'وسط المدينة', desc: 'انعكاسات أبراج وظلال مدنية', icon: '🏙️' },
  { id: 'forest', name: 'وسط الغابة', desc: 'إضاءة طبيعية خضراء وانعكاسات أشجار', icon: '🌲' },
];

export const QUICK_COMMANDS = [
  { id: 'people', name: 'إضافة أشخاص', icon: '👥', prompt: 'أضف أشخاصاً بملابس عصرية يتفاعلون مع المكان بشكل واقعي' },
  { id: 'plants', name: 'تنسيق حدائق', icon: '🌿', prompt: 'أضف نباتات زينة وأشجار لاندسكيب احترافية' },
  { id: 'cars', name: 'سيارات فارهة', icon: '🚗', prompt: 'أضف سيارة مرسيدس سوداء حديثة في مقدمة الصورة' },
  { id: 'materials', name: 'رخام فاخر', icon: '💎', prompt: 'استبدل خامة الأرضية برخام إيطالي فاخر ذو انعكاس عالي' },
  { id: 'weather', name: 'أجواء ماطرة', icon: '🌧️', prompt: 'اجعل الجو ماطراً مع إضافة انعكاسات الماء على الأرضية' },
];

export const ASPECT_RATIOS: { id: AspectRatio; name: string; icon: string }[] = [
  { id: '1:1', name: 'مربع', icon: '⬜' },
  { id: '4:3', name: 'كلاسيك', icon: '📺' },
  { id: '3:4', name: 'بورتريه', icon: '📱' },
  { id: '16:9', name: 'سينمائي', icon: '🎞️' },
  { id: '9:16', name: 'طولي', icon: '🤳' },
];

export const IMAGE_SIZES: { id: ImageSize; name: string; desc: string }[] = [
  { id: '1K', name: '1K Standard', desc: 'سريع' },
  { id: '2K', name: '2K HD', desc: 'جودة V-Ray (Pro)' },
  { id: '4K', name: '4K Ultra', desc: 'فائق الدقة (Pro)' },
];
