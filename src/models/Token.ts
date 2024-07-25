import { sequelize } from '../config/db';
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
UUIDV4,
} from 'sequelize';

interface TokenModel
  extends Model<InferAttributes<TokenModel>, InferCreationAttributes<TokenModel>> {
  id?: CreationOptional<number>;
  uuid: CreationOptional<string>;
  token: string;
  AuthId?:CreationOptional<number>
}
export const Token = sequelize.define<TokenModel>('Token', {
  uuid: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    unique: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});
