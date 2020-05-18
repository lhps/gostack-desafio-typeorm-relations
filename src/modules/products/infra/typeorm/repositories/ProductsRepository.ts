import { getRepository, Repository, In } from 'typeorm';

import AppError from '@shared/errors/AppError';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO
    const productsIds = products.map(product => product.id);

    const orderProducts = await this.ormRepository.find({
      id: In(productsIds),
    });

    if (productsIds.length !== orderProducts.length) {
      throw new AppError('One or more products does not exists.');
    }

    return orderProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO
    const productsInfo = await this.findAllById(products);

    const newProducts = productsInfo.map(productInfo => {
      const productFind = products.find(
        product => product.id === productInfo.id,
      );

      if (!productFind) {
        throw new AppError('Product not found.');
      }

      const productWithNewQuantity = productInfo;

      if (productWithNewQuantity.quantity < productFind.quantity) {
        throw new AppError('Insufficient product quantity');
      }

      productWithNewQuantity.quantity -= productFind.quantity;

      return productWithNewQuantity;
    });

    await this.ormRepository.save(newProducts);

    return newProducts;
  }
}

export default ProductsRepository;
