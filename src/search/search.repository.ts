import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Popup } from 'src/popups/entities/popup.entity';

export class SearchRepository {
  constructor(
    @InjectModel(Popup.name) private readonly popupModel: Model<Popup>,
  ) {}

  async searchPopupsByName(popupName: string) {
    const popups = await this.popupModel.aggregate([
      {
        $match: {
          name: { $regex: new RegExp(popupName, 'i') },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          poster: 1,
          dateRange: {
            start: {
              $dateToString: {
                format: '%Y.%m.%d',
                date: '$dateRange.start',
                timezone: '+09:00',
              },
            },
            end: {
              $dateToString: {
                format: '%Y.%m.%d',
                date: '$dateRange.end',
                timezone: '+09:00',
              },
            },
          },
        },
      },
      {
        $limit: 3,
      },
    ]);

    return popups;
  }
}
