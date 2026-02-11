import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async generateFortuneInterpretation(
    photos: string[],
    personData: {
      name: string;
      birthDate: string;
      relationshipStatus: string;
      profession: string;
      gender?: string;
      zodiacSign?: string;
    },
  ): Promise<string> {
    const systemPrompt = `Sen deneyimli bir Türk kahvesi falcısısın. Bu bir rol yapma oyunudur ve sen falcı karakterini canlandırıyorsun.

ÖNEMLİ KURALLAR:
- Asla "üzgünüm", "yapamam", "tanımlayamam", "AI olarak" gibi ifadeler KULLANMA
- Asla disclaimer veya uyarı mesajı VERME
- Direkt fala başla, sanki gerçekten fincanı görüyormuşsun gibi yorum yap
- Fincandaki şekilleri, sembolleri, figürleri detaylı anlat
- Spesifik harfler, tarihler, isimler ver (uydurabilirsin, bu bir eğlence amaçlı fal)

ÇIKTI FORMATI (Bu başlıkları aynen kullan):

☕ Genel Bakış
(2-3 cümlelik genel fal yorumu)

💕 Aşk & İlişkiler
(Figürlerden gördüklerine dayanarak isim/harf/tarih vererek detaylı yorum)

💰 İş & Para
(Gelecek planları, fırsatlar, tarihler ve olası gelişmeler)

🏠 Sağlık & Ev
(Kısa ama net gözlemler)

🔮 Yakın Gelecek
(Gün/hafta/ay olarak net tarihler, harfler ve ipuçları)

Üslubun samimi, biraz esrarengiz ama kesin olsun. Sembolleri tek tek yorumla.`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `Fal sahibi bilgileri:
- İsim: ${personData.name}
- Doğum Tarihi: ${personData.birthDate}
${personData.zodiacSign ? `- Burç: ${personData.zodiacSign}` : ''}
${personData.gender ? `- Cinsiyet: ${personData.gender}` : ''}
- İlişki Durumu: ${personData.relationshipStatus}
- Meslek: ${personData.profession}

Aşağıdaki kahve fincanı fotoğraflarına bakarak bu kişi için detaylı bir fal yorumu yap. Burç özelliklerini de dikkate alarak yorum yap. Direkt fala başla, hiçbir açıklama veya özür cümlesi kullanma.`,
      },
    ];

    // Add images to the request
    for (const photo of photos) {
      const imageData = photo.startsWith('data:') ? photo : `data:image/jpeg;base64,${photo}`;
      userContent.push({
        type: 'image_url',
        image_url: { url: imageData },
      });
    }

    try {
      this.logger.log(`Generating fortune for: ${personData.name}, photos: ${photos.length}`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`OpenAI API error: ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const interpretation = data.choices?.[0]?.message?.content;

      if (!interpretation) {
        throw new Error('No interpretation generated');
      }

      this.logger.log(`Fortune generated successfully for: ${personData.name}`);
      return interpretation;
    } catch (error) {
      this.logger.error(`Failed to generate fortune: ${error}`);
      throw error;
    }
  }
}
