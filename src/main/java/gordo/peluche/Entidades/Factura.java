package gordo.peluche.Entidades;
import java.util.List;

import jakarta.persistence.*;

@Entity
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nomcli;
    private List<Peluche> peluches;
    private int iva;
    private float subtotal;
    private float total;

}
