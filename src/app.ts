import bitcoin = require('bitcoinjs-lib');
import bip39 = require('bip39');
import $ = require('jquery');

export class Wallet {
  private mnemonic: string;
  private m: bitcoin.HDNode;
  
  public constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
    this.m = this.mnemonicToM(mnemonic, '', 'bitcoin');
  }
  
  public getAddress(no: number) {
    return this.m.derivePath("m/44'/0'/0'/0/" + no).getAddress();
  }
  
  public getP2SHSegwitAddress(no: number) {
    const wif = this.m.derivePath("m/49'/0'/0'/0/" + no).keyPair.toWIF();
    const keyPair = bitcoin.ECPair.fromWIF(wif, bitcoin.networks.bitcoin);
    const pubKey = keyPair.getPublicKeyBuffer();
    const redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
    const scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript));
    const segwitAddress = bitcoin.address.fromOutputScript(scriptPubKey);
    return segwitAddress;
  }

  public mnemonicToM(mnemonic, password, network): bitcoin.HDNode {
    const seed = bip39.mnemonicToSeed(mnemonic, password || "")
    const m = bitcoin.HDNode.fromSeedBuffer(seed, bitcoin.networks[network || "bitcoin"])
    return m
  }
}

$(() => {
  let count = 10;

  $('#generate').click('on', () => {
    const $loading= $('#loading');
    const $more = $('#more');
  
    $more.hide();
    $loading.show();
  
    const mnemonicToM = $('#recoveryphrase').val(); 
    if (!mnemonicToM) {
    $loading.hide();
        alert('Please enter Recovery Phrase');
        return;
    }
  
    const $generated_addresses = $('#generated_addresses');
    const segwit = $('#segwit').prop('checked') ? true : false;
    const wallet = new Wallet(mnemonicToM);
	
	let segwit_data = $generated_addresses.data('segwit');
	if (segwit_data !== undefined && segwit != segwit_data) {
		$generated_addresses.empty();
	}
	
	let pos = $generated_addresses.data('pos');
	if (!pos) {
		pos = 0;
	}
    
    setTimeout(() => {
     for (let i = pos; i < pos + count; i++) {
      let address: string = wallet.getAddress(i);
      if (segwit) {
        address = wallet.getP2SHSegwitAddress(i);
      } else {
        address = wallet.getAddress(i);
      }
      console.log(address);
	  let $link = $('<a target="_blank"></a>').attr('href', 'https://blockchain.info/address/' + address).text(address);
      $('<li class="list-group-item"></li>').append($link).appendTo($generated_addresses);
     }
     $more.show();
     $loading.hide();
	 $generated_addresses.data('pos', pos + count);
	 $generated_addresses.data('segwit', segwit);
    }, 100);
    
	return false;
  });
  
  $('#more').click('on', () => {
    const $generated_addresses = $('#generated_addresses');
	let pos = $generated_addresses.data('pos');
	$generated_addresses.data('pos', pos + count);
	$('#generate').triggerHandler('click');
	return false;
  });
});

