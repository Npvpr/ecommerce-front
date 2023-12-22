import Center from "@/components/Center";
import Header from "@/components/Header";
import Title from "@/components/Title";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import styled from "styled-components";
import WhiteBox from "@/components/WhiteBox";
import ProductImages from "@/components/ProductImages";
import CartIcon from "@/components/icons/CartIcon";
import FlyingButton from "@/components/FlyingButton";
import ProductReviews from "@/components/ProductReviews";
import ProductsGrid from "@/components/ProductsGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { WishedProduct } from "@/models/WishedProduct";
import Footer from "@/components/Footer";
import { useState } from "react";

const ColWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: 0.8fr 1.2fr;
  }
  gap: 40px;
  margin: 40px 0;
`;
const PriceRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;
const Price = styled.span`
  font-size: 1.4rem;
`;
const ChoiceContainer = styled.div`
  margin: 10px;
`;
const ChoiceRow = styled.div`
  display: flex;
`;
const Choice = styled.div`
  margin: 10px;
  border: solid 1px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  ${(props) =>
    props.active
      ? `
color:black;
border-bottom: 2px solid black;
`
      : `
color:#999;
`}
`;

export default function ProductPage({ product, products, wishedProducts }) {
  const [activeColor, setActiveColor] = useState(0);
  const [activeStorage, setActiveStorage] = useState(0);
  return (
    <>
      <Header />
      <Center>
        <ColWrapper>
          <WhiteBox>
            <ProductImages images={product.images} />
          </WhiteBox>
          <div>
            <Title className={"text-sky-950"}>{product.title}</Title>
            <p>{product.description}</p>
            {product._id === "655eee32b929f42f0c800072" ? (
              <ChoiceContainer>
                <h3>Colors</h3>
                <ChoiceRow>
                  <Choice
                    onClick={() => setActiveColor(0)}
                    active={activeColor === 0}
                  >
                    Dark
                  </Choice>
                  <Choice
                    onClick={() =>setActiveColor(1)}
                    active={activeColor === 1}
                  >
                    Silver
                  </Choice>
                </ChoiceRow>
                <h3>Storage</h3>
                <ChoiceRow>
                  <Choice
                    onClick={() =>setActiveStorage(0)}
                    active={activeStorage === 0}
                  >
                    256GB
                  </Choice>
                  <Choice
                    onClick={() =>setActiveStorage(1)}
                    active={activeStorage === 1}
                  >
                    512GB
                  </Choice>
                </ChoiceRow>
              </ChoiceContainer>
            ) : (
              <></>
            )}
            <PriceRow>
              <div>
                <Price>${product.price}</Price>
              </div>
              <div>
                <FlyingButton main _id={product._id} src={product.images?.[0]}>
                  <CartIcon />
                  Add to cart
                </FlyingButton>
              </div>
            </PriceRow>
          </div>
        </ColWrapper>
        <ProductReviews product={product} />
      </Center>
      <ProductsGrid />
      <Center>
        <Title>Recommended Products</Title>
        {products.length !== 0 ? (
          <ProductsGrid products={products} wishedProducts={wishedProducts} />
        ) : (
          <div>No related Products</div>
        )}
      </Center>
      <Footer />
    </>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const { id } = ctx.query;
  const product = await Product.findById(id);
  const products = await Product.find(
    { category: product.category, _id: { $ne: product._id } },
    null,
    { sort: { _id: -1 } }
  );
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail: session?.user.email,
        product: products.map((p) => p._id.toString()),
      })
    : [];
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      products: JSON.parse(JSON.stringify(products)),
      wishedProducts: wishedProducts.map((i) => i.product.toString()),
    },
  };
}
