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
    const personInfo = `İsim: ${personData.name}, Doğum Tarihi: ${personData.birthDate}, İlişki Durumu: ${personData.relationshipStatus}, Meslek: ${personData.profession}${personData.gender ? `, Cinsiyet: ${personData.gender}` : ''}`;

    const systemPrompt = `Sen deneyimli bir Türk kahve falcısısın. Mistik ve gizemli bir dille, fincan görüntülerini ve kişinin bilgilerini kullanarak detaylı bir fal yorumu yap. Gelecekle ilgili öngörüler, aşk, kariyer ve şans hakkında mistik ifadeler kullan. Yorum en az 500 kelime olsun ve Türkçe yazılsın. Zengin, şiirsel ve mistik bir dil kullan.`;

    const userContent: any[] = [
      {
        type: 'text',
        text: `Kişi bilgileri: ${personInfo}\n\nFincan görüntüleri aşağıda. Bu görüntüleri analiz ederek detaylı bir kahve falı yorumu yap:`,
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
