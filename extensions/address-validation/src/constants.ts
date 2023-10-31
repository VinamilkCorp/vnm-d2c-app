export enum AddressErrorTargets {
  Email = "$.cart.buyerIdentity.email",
  BuyerPhone = "$.cart.buyerIdentity.phone",
  Address1 = "$.cart.deliveryGroups[0].deliveryAddress.address1",
  Address2 = "$.cart.deliveryGroups[0].deliveryAddress.address2",
  City = "$.cart.deliveryGroups[0].deliveryAddress.city",
  Company = "$.cart.deliveryGroups[0].deliveryAddress.company",
  CountryCode = "$.cart.deliveryGroups[0].deliveryAddress.countryCode",
  FirstName = "$.cart.deliveryGroups[0].deliveryAddress.firstName",
  LastName = "$.cart.deliveryGroups[0].deliveryAddress.lastName",
  Phone = "$.cart.deliveryGroups[0].deliveryAddress.phone",
  ProvinceCode = "$.cart.deliveryGroups[0].deliveryAddress.provinceCode",
  Zip = "$.cart.deliveryGroups[0].deliveryAddress.zip",
}
