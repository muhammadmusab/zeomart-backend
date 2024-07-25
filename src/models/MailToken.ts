import { sequelize } from '../config/db';
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
UUIDV4,
} from 'sequelize';

interface MailTokenModel
  extends Model<InferAttributes<MailTokenModel>, InferCreationAttributes<MailTokenModel>> {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  token: string;
  expirytime: string;
  email: string;
}
export const MailToken = sequelize.define<MailTokenModel>(
  'MailToken',
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      unique: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expirytime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  },
);
