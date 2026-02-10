import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://apps.abacus.ai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACUSAI_API_KEY') || '';
  }

  async generateFortuneInterpretation(
    photos: string[],
    personData: {
      name: string;
      birthDate: string;
      relationshipStatus: string;
      profession: string;
      gender?: string;
    },
  ): Promise<string> {
    const systemPrompt = `Sen gerçek bir kahve falcısın. Belleğini sıfırla ve beni hiç tanımıyormuşsun gibi davran. Elimdeki kahve fincanı fotoğrafına bakıp detaylı bir kahve falı çıkar.

İstenen çıktı formatı şu şekilde olacak:
1️⃣ Kısa Genel Özet: 2–3 cümlelik genel bir fal yorumu.
2️⃣ Aşk: Figürlerden gördüklerine dayanarak isim/harf/tarih/aralık vererek detaylı yorum yap.
3️⃣ İş & Para: Gelecek planları, fırsatlar, tarihler ve olası gelişmelerle birlikte anlat.
4️⃣ Sağlık & Ev: Kısa ama net gözlemler belirt.
5️⃣ Yakın Gelecek (Net Vade): Gün/hafta/ay olarak net tarihler, harfler ve ipuçları ver.

Üslubun samimi, biraz esrarengiz ama kesin ve gerçek bir falcı havasında olsun. Masalsı anlatım yapma, sembolleri tek tek yorumla.`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `Adım: ${personData.name}, Doğum Tarihim: ${personData.birthDate}${personData.gender ? `, Cinsiyetim: ${personData.gender}` : ''}, İlişki Durumum: ${personData.relationshipStatus}, Mesleğim: ${personData.profession}\n\nFincan görüntüleri aşağıda. Bu görüntüleri analiz ederek detaylı bir kahve falı yorumu yap:`,
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
      this.logger.log(`Generating fortune for: ${personData.name}`);
      
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
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`LLM API error: ${errorText}`);
        throw new Error(`LLM API error: ${response.status}`);
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
