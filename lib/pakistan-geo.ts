// Pakistan Geo Data: Province → Districts → Tehsils → Cities
// Covers all 4 provinces + AJK + FATA (now merged into KPK) + GB + ICT

export type GeoEntry = {
    districts: {
        [district: string]: {
            tehsils: string[];
        };
    };
};

export const PAKISTAN_GEO: Record<string, GeoEntry> = {
    'Punjab': {
        districts: {
            'Lahore': { tehsils: ['Lahore City', 'Lahore Cantonment', 'Model Town', 'Raiwind', 'Shalimar'] },
            'Faisalabad': { tehsils: ['Faisalabad City', 'Iqbal Town', 'Jaranwala', 'Samundri', 'Tandlianwala'] },
            'Rawalpindi': { tehsils: ['Rawalpindi', 'Gujar Khan', 'Kahuta', 'Kotli Sattian', 'Murree', 'Taxila'] },
            'Gujranwala': { tehsils: ['Gujranwala City', 'Kamoke', 'Nowshera Virkan', 'Wazirabad'] },
            'Multan': { tehsils: ['Multan City', 'Jalalpur Pirwala', 'Shujabad', 'Shujaabad'] },
            'Bahawalpur': { tehsils: ['Bahawalpur', 'Ahmadpur East', 'Hasilpur', 'Khairpur Tamewali'] },
            'Sargodha': { tehsils: ['Sargodha City', 'Bhalwal', 'Kot Momin', 'Sahiwal', 'Shahpur', 'Silanwali'] },
            'Sialkot': { tehsils: ['Sialkot City', 'Daska', 'Pasrur', 'Sambrial'] },
            'Rahim Yar Khan': { tehsils: ['Rahim Yar Khan', 'KhanPur', 'Liaqatpur', 'Sadiqabad'] },
            'Sheikhupura': { tehsils: ['Sheikhupura', 'Ferozewala', 'Muridke', 'Nankana Sahib', 'Safdarabad'] },
            'Jhang': { tehsils: ['Jhang City', 'Ahmadpur Sial', 'Shorkot', 'Toba Tek Singh'] },
            'Dera Ghazi Khan': { tehsils: ['Dera Ghazi Khan', 'Kot Chuta', 'Taunsa', 'Vehoa'] },
            'Gujrat': { tehsils: ['Gujrat', 'Kharian', 'Sarai Alamgir'] },
            'Kasur': { tehsils: ['Kasur', 'Chunian', 'Kot Radha Kishan', 'Pattoki'] },
            'Mardan': { tehsils: ['Mardan', 'Katlang', 'Takht Bhai'] },
            'Okara': { tehsils: ['Okara', 'Depalpur', 'Renala Khurd'] },
            'Sahiwal': { tehsils: ['Sahiwal', 'Chichawatni', 'Haveli Lakha'] },
            'Attock': { tehsils: ['Attock', 'Fateh Jang', 'Hazro', 'Jand', 'Pindigheb'] },
            'Lodhran': { tehsils: ['Lodhran', 'Dunyapur', 'Kehror Pakka'] },
            'Narowal': { tehsils: ['Narowal', 'Shakargarh', 'Zafarwal'] },
            'Nankana Sahib': { tehsils: ['Nankana Sahib', 'Sangla Hill', 'Shah Kot'] },
            'Khanewal': { tehsils: ['Khanewal', 'Kabir Wala', 'Mian Channu', 'Tulamba'] },
            'Pakpattan': { tehsils: ['Pakpattan', 'Arifwala'] },
            'Chiniot': { tehsils: ['Chiniot', 'Bhawana', 'Lalian'] },
            'Hafizabad': { tehsils: ['Hafizabad', 'Pindi Bhattian'] },
            'Mianwali': { tehsils: ['Mianwali', 'Esa Khel', 'Piplan'] },
            'Bhakkar': { tehsils: ['Bhakkar', 'Darya Khan', 'Kallur Kot', 'Mankera'] },
            'Bahawalnagar': { tehsils: ['Bahawalnagar', 'Chishtian', 'Fort Abbas', 'Haroonabad', 'Minchinabad'] },
            'Muzaffargarh': { tehsils: ['Muzaffargarh', 'Ali Pur', 'Jatoi', 'Kot Addu'] },
            'Layyah': { tehsils: ['Layyah', 'Chowbara', 'Karor Lal Esan'] },
            'Vehari': { tehsils: ['Vehari', 'Burewala', 'Mailsi'] },
            'Toba Tek Singh': { tehsils: ['Toba Tek Singh', 'Gojra', 'Kamalia', 'Rajana'] },
            'Rajanpur': { tehsils: ['Rajanpur', 'Jampur', 'Rojhan'] },
            'Khushab': { tehsils: ['Khushab', 'Joharabad', 'Noorpur', 'Quaidabad'] },
            'Chakwal': { tehsils: ['Chakwal', 'Choa Saidan Shah', 'Kallar Kahar', 'Talagang'] },
        }
    },
    'Khyber Pakhtunkhwa': {
        districts: {
            'Peshawar': { tehsils: ['Peshawar City', 'Peshawar Cantonment', 'Chamkani', 'Mattani', 'Regi'] },
            'Mardan': { tehsils: ['Mardan', 'Katlang', 'Takht Bhai'] },
            'Swat': { tehsils: ['Swat', 'Bahrain', 'Charbagh', 'Kabal', 'Khwazakhela', 'Matta'] },
            'Abbottabad': { tehsils: ['Abbottabad', 'Havelian', 'Lora', 'Nathiagali'] },
            'Mansehra': { tehsils: ['Mansehra', 'Balakot', 'Batagram', 'Oghi', 'Pakhal', 'Sherwan'] },
            'Charsadda': { tehsils: ['Charsadda', 'Shabqadar', 'Tangi'] },
            'Nowshera': { tehsils: ['Nowshera', 'Akora Khattak', 'Jehangira', 'Pabbi'] },
            'Haripur': { tehsils: ['Haripur', 'Ghazi', 'Khanpur'] },
            'Kohat': { tehsils: ['Kohat', 'Darra Adam Khel', 'Lachi'] },
            'Karak': { tehsils: ['Karak', 'Band Daud Shah', 'Mangal Thana', 'Takht-e-Nasrati'] },
            'Hangu': { tehsils: ['Hangu', 'Thall'] },
            'Buner': { tehsils: ['Buner', 'Daggar', 'Kingargalai', 'Mandanr'] },
            'Dir Lower': { tehsils: ['Dir Lower', 'Adenzai', 'Balambat', 'Timergara'] },
            'Dir Upper': { tehsils: ['Dir Upper', 'Drosh', 'Patrak', 'Wari'] },
            'Chitral': { tehsils: ['Chitral', 'Drosh', 'Mastuj'] },
            'Malakand': { tehsils: ['Malakand', 'Bat Khela', 'Thana'] },
            'Shangla': { tehsils: ['Shangla', 'Alpuri', 'Bismillah', 'Chakesar', 'Martung', 'Puran'] },
            'Battagram': { tehsils: ['Battagram', 'Allai', 'Battagram City', 'Daggar'] },
            'Bannu': { tehsils: ['Bannu', 'Domel', 'Pezu'] },
            'Lakki Marwat': { tehsils: ['Lakki Marwat', 'Naurang', 'Serai Naurang'] },
            'Tank': { tehsils: ['Tank', 'Gomal', 'Kulachi'] },
            'Dera Ismail Khan': { tehsils: ['Dera Ismail Khan', 'Daraban', 'Parova', 'Paharpur'] },
            'Swabi': { tehsils: ['Swabi', 'Lahor', 'Razar', 'Topi'] },
        }
    },
    'Sindh': {
        districts: {
            'Karachi East': { tehsils: ['Bin Qasim', 'Gadap', 'Gulshan-e-Iqbal', 'Jamshed', 'Landhi'] },
            'Karachi West': { tehsils: ['Baldia', 'Keamari', 'Mominabad', 'Orangi'] },
            'Karachi South': { tehsils: ['Civil Lines', 'Clifton', 'Lyari', 'Saddar'] },
            'Karachi Central': { tehsils: ['Liaquatabad', 'New Karachi', 'North Nazimabad', 'Orangi'] },
            'Karachi Korangi': { tehsils: ['Korangi', 'Landhi', 'Model Colony', 'Shah Faisal'] },
            'Hyderabad': { tehsils: ['City', 'Hyderabad', 'Latifabad', 'Qasimabad'] },
            'Sukkur': { tehsils: ['Sukkur', 'Rohri', 'Saleh Pat'] },
            'Larkana': { tehsils: ['Larkana', 'Dokri', 'Kambar', 'Shahdadkot'] },
            'Nawabshah': { tehsils: ['Nawabshah', 'Daur', 'Qazi Ahmed', 'Sakrand'] },
            'Mirpur Khas': { tehsils: ['Mirpur Khas', 'Digri', 'Kot Ghulam Muhammad', 'Sindhri', 'Tando Jan Muhammad'] },
            'Thatta': { tehsils: ['Thatta', 'Ghorabari', 'Sujawal'] },
            'Badin': { tehsils: ['Badin', 'Matiari', 'Talhar'] },
            'Matiari': { tehsils: ['Matiari', 'Hala', 'Saeedabad'] },
            'Jacobabad': { tehsils: ['Jacobabad', 'Thul'] },
            'Kashmore': { tehsils: ['Kashmore', 'Kandhkot', 'Tangwani'] },
            'Shikarpur': { tehsils: ['Shikarpur', 'Garhi Yasin', 'Lakhi'] },
        }
    },
    'Balochistan': {
        districts: {
            'Quetta': { tehsils: ['Quetta City', 'Chiltan', 'Saranan', 'Spin Karez'] },
            'Gwadar': { tehsils: ['Gwadar', 'Jiwani', 'Ormara', 'Pasni'] },
            'Turbat': { tehsils: ['Turbat', 'Buleda', 'Mand', 'Tump'] },
            'Khuzdar': { tehsils: ['Khuzdar', 'Ornach', 'Wadh', 'Zehri'] },
            'Kalat': { tehsils: ['Kalat', 'Gazg', 'Mangochar', 'Surab'] },
            'Chaman': { tehsils: ['Chaman', 'Dobandi', 'Karezat', 'Loe Shilman'] },
            'Loralai': { tehsils: ['Loralai', 'Barkhan', 'Duki', 'Mekhtar'] },
            'Zhob': { tehsils: ['Zhob', 'Killa Saifullah', 'Sherani', 'Zhob City'] },
            'Dera Bugti': { tehsils: ['Dera Bugti', 'Phelawagh', 'Sui'] },
            'Nasirabad': { tehsils: ['Nasirabad', 'Chattar', 'Dera Murad Jamali', 'Tamboo'] },
            'Kharan': { tehsils: ['Kharan', 'Besima', 'Nag', 'Washap'] },
            'Lasbela': { tehsils: ['Lasbela', 'Bela', 'Hub', 'Kanraj', 'Liari', 'Sonmiani', 'Uthal', 'Winder'] },
        }
    },
    'Azad Jammu & Kashmir': {
        districts: {
            'Muzaffarabad': { tehsils: ['Muzaffarabad City', 'Chakothi', 'Hattian Bala', 'Neel'] },
            'Mirpur': { tehsils: ['Mirpur City', 'Chakswari', 'Dadyal', 'Hatian', 'Kotli'] },
            'Rawalakot': { tehsils: ['Rawalakot', 'Abbaspur', 'Bagh', 'Hajira', 'Kahuta'] },
            'Bagh': { tehsils: ['Bagh', 'Dhirkot', 'Haveli', 'Kahuta'] },
            'Kotli': { tehsils: ['Kotli', 'Charhoi', 'Nikyal', 'Sehnsa'] },
            'Bhimber': { tehsils: ['Bhimber', 'Samahni', 'Taryala'] },
            'Neelum': { tehsils: ['Neelum', 'Athmuqam', 'Kutton', 'Sharda'] },
            'Sudhnoti': { tehsils: ['Sudhnoti', 'Mang', 'Pallandri'] },
            'Hattian Bala': { tehsils: ['Hattian Bala', 'Neel'] },
        }
    },
    'Gilgit-Baltistan': {
        districts: {
            'Gilgit': { tehsils: ['Gilgit City', 'Danyor', 'Gulmit', 'Sher Qilla'] },
            'Skardu': { tehsils: ['Skardu', 'Gultari', 'Kachura', 'Kharmang', 'Rondu', 'Shigar'] },
            'Hunza': { tehsils: ['Hunza', 'Aliabad', 'Altit', 'Gulmit', 'Nagar'] },
            'Ghanche': { tehsils: ['Ghanche', 'Daghoni', 'Khaplu', 'Machulo', 'Saltoro'] },
            'Astore': { tehsils: ['Astore', 'Chatorkhand', 'Doian', 'Rama', 'Tarishing'] },
            'Diamer': { tehsils: ['Diamer', 'Chilas', 'Darel', 'Tangir'] },
        }
    },
    'Islamabad Capital Territory': {
        districts: {
            'Islamabad': { tehsils: ['Islamabad City', 'Kahuta', 'Murree', 'Sihala'] },
        }
    },
};

export const COUNTRIES = [
    'Pakistan', 'Afghanistan', 'Bangladesh', 'China', 'India', 'Iran', 'Saudi Arabia',
    'United Arab Emirates', 'United Kingdom', 'United States', 'Canada', 'Australia',
    'Germany', 'France', 'Turkey', 'Malaysia', 'Indonesia', 'Japan', 'South Korea',
    'Other',
];
